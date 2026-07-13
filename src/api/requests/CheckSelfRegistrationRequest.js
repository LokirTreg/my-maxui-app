import { ProcessApiRequest } from './ProcessApiRequest';
import { assertBoolean, assertObject } from '../validation';

export class CheckSelfRegistrationRequest extends ProcessApiRequest {
    get processMethod() {
        return 'check_self_registration';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.phone;
    }

    buildProcessParams() {
        return {
            phone: String(this.params.phone || ''),
        };
    }

    buildMockResponse() {
        return {
            registered: true,
        };
    }

    transformEnvelopeData(data) {
        if (typeof data === 'boolean') {
            return {
                registered: data,
            };
        }

        const normalizedData = Array.isArray(data) ? data[0] : data;

        return {
            registered: Boolean(
                    normalizedData?.is_registered
            ),
        };
    }

    validateResponse(response) {
        assertObject(response, 'checkSelfRegistration.response');
        assertBoolean(
            response.registered,
            'checkSelfRegistration.response.registered'
        );
    }
}
