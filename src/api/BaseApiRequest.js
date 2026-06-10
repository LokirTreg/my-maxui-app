const DEFAULT_DELAY_MIN_MS = 300;
const DEFAULT_DELAY_MAX_MS = 700;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const isObject = (value) =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const DETAILS_LIMIT = 1200;

const truncate = (value, limit = DETAILS_LIMIT) => {
    if (value.length <= limit) {
        return value;
    }

    return `${value.slice(0, limit)}...`;
};

const stringifyDetailsValue = (value) => {
    if (value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return truncate(value);
    }

    try {
        return truncate(JSON.stringify(value));
    } catch {
        return String(value);
    }
};

export class ApiValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'ApiValidationError';
        this.details = details;
    }
}

export class ApiRequestError extends Error {
    constructor(message, details = {}, cause) {
        super(message);
        this.name = 'ApiRequestError';
        this.details = details;
        this.cause = cause;
    }
}

export class BaseApiRequest {
    constructor(params = {}, options = {}) {
        this.params = params;
        this.options = {
            delayMaxMs: DEFAULT_DELAY_MAX_MS,
            delayMinMs: DEFAULT_DELAY_MIN_MS,
            mode: 'mock',
            ...options,
        };
    }

    get endpoint() {
        throw new Error('Endpoint must be defined in child request class');
    }

    get method() {
        return 'GET';
    }

    async execute() {
        this.validateParams(this.params);
        console.log('Request mode:', this.options.mode);

        const rawResponse =
            this.options.mode === 'http'
                ? this.readEnvelopeResponse(await this.fetchResponse())
                : await this.mockResponse();

        try {
            this.validateResponse(rawResponse);
        } catch (error) {
            throw this.createRequestError(
                'API data не прошла валидацию',
                {
                    data: rawResponse,
                },
                error
            );
        }

        return this.transformResponse(rawResponse);
    }

    validateParams() {}

    validateResponse() {}

    transformResponse(response) {
        return response;
    }

    transformEnvelopeData(data) {
        return data;
    }

    buildQuery() {
        return new URLSearchParams();
    }

    buildBody() {
        return undefined;
    }

    buildHeaders() {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }

    buildMockResponse() {
        throw new Error('buildMockResponse must be implemented for mock mode');
    }

    getMockFailureKey() {
        return '';
    }

    async mockResponse() {
        await wait(
            getRandomDelay(this.options.delayMinMs, this.options.delayMaxMs)
        );

        if (String(this.getMockFailureKey()).toLowerCase() === 'error') {
            throw new Error('Mock API временно недоступен');
        }

        return this.buildMockResponse();
    }

    async fetchResponse() {
        const url = this.buildUrl();
        const body = this.buildBody();
        console.log('Fetching URL:', url);
        console.log('Request body:', body || '<empty>');

        let response;

        try {
            response = await fetch(url, {
                body,
                headers: this.buildHeaders(),
                method: this.method,
            });
        } catch (error) {
            throw this.createRequestError(
                'HTTP запрос не выполнен',
                {
                    hint: this.getFetchFailureHint(error),
                    url,
                },
                error
            );
        }

        const responseText = await response.text();

        if (!response.ok) {
            throw this.createRequestError('HTTP ответ с ошибкой', {
                body: responseText,
                status: response.status,
                statusText: response.statusText,
                url,
            });
        }

        try {
            return responseText ? JSON.parse(responseText) : null;
        } catch (error) {
            throw this.createRequestError(
                'API вернул невалидный JSON',
                {
                    body: responseText,
                    url,
                },
                error
            );
        }
    }

    readEnvelopeResponse(response) {
        try {
            this.validateEnvelopeResponse(response);
        } catch (error) {
            throw this.createRequestError(
                'API вернул неожиданный формат envelope',
                {
                    response,
                },
                error
            );
        }

        if (!response.success) {
            throw this.createRequestError('API вернул success=false', {
                apiMessage: response.message,
                data: response.data,
                timestamp: response.timestamp,
            });
        }

        return this.transformEnvelopeData(response.data, response);
    }

    createRequestError(title, details = {}, cause) {
        const requestDetails = this.getRequestDetails(details);
        const causeMessage =
            cause instanceof Error ? cause.message : stringifyDetailsValue(cause);
        const parts = [
            causeMessage ? `${title}: ${causeMessage}` : title,
            ...Object.entries(requestDetails)
                .filter(([, value]) => value !== '')
                .map(([key, value]) => `${key}=${stringifyDetailsValue(value)}`),
        ];

        return new ApiRequestError(parts.join(' | '), requestDetails, cause);
    }

    getRequestDetails(details = {}) {
        return {
            request: this.constructor.name,
            processMethod: this.getOptionalProcessMethod(),
            httpMethod: this.method,
            mode: this.options.mode,
            endpoint: this.endpoint,
            params: this.params,
            ...details,
        };
    }

    getOptionalProcessMethod() {
        try {
            return this.processMethod;
        } catch {
            return '';
        }
    }

    getFetchFailureHint(error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return 'Браузер не получил ответ. Частые причины: CORS, недоступный домен, SSL/сертификат, блокировка WebView или отсутствие сети.';
        }

        return '';
    }

    validateEnvelopeResponse(response) {
        if (!isObject(response)) {
            throw new ApiValidationError('API response должен быть объектом', {
                response,
            });
        }

        if (typeof response.success !== 'boolean') {
            throw new ApiValidationError(
                'API response.success должен быть boolean',
                { response }
            );
        }

        if (typeof response.message !== 'string') {
            throw new ApiValidationError(
                'API response.message должен быть строкой',
                { response }
            );
        }

        if (typeof response.timestamp !== 'string') {
            throw new ApiValidationError(
                'API response.timestamp должен быть строкой',
                { response }
            );
        }

        if (
            response.success &&
            !Object.prototype.hasOwnProperty.call(response, 'data')
        ) {
            throw new ApiValidationError('API response.data отсутствует', {
                response,
            });
        }
    }

    buildUrl() {
        const query = this.buildQuery();
        const baseUrl = this.options.baseUrl || '';
        const url = new URL(this.endpoint, baseUrl || window.location.origin);

        query.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        console.log('Built URL:', url.toString());

        return url.toString();
    }
}
