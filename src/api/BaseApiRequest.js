const DEFAULT_DELAY_MIN_MS = 300;
const DEFAULT_DELAY_MAX_MS = 700;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

export class ApiValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'ApiValidationError';
        this.details = details;
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

        const response =
            this.options.mode === 'http'
                ? await this.fetchResponse()
                : await this.mockResponse();

        this.validateResponse(response);

        return this.transformResponse(response);
    }

    validateParams() {}

    validateResponse() {}

    transformResponse(response) {
        return response;
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
        const response = await fetch(url, {
            body,
            headers: this.buildHeaders(),
            method: this.method,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    buildUrl() {
        const query = this.buildQuery();
        const baseUrl = this.options.baseUrl || '';
        const url = new URL(this.endpoint, baseUrl || window.location.origin);

        console.log('Built URL:', url.toString());
        query.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        return url.toString();
    }
}
