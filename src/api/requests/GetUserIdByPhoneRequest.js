import { ProcessApiRequest } from './ProcessApiRequest';
import { assertObject, assertString } from '../validation';

export class GetUserIdByPhoneRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_user_id_by_phone';
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
        const phone = String(this.params.phone || '');

        return {
            userId: phone ? `mock-user-${phone}` : '',
        };
    }

    transformEnvelopeData(data) {
        const normalizedData = Array.isArray(data) ? data[0] : data;

        if (
            typeof normalizedData === 'string' ||
            typeof normalizedData === 'number'
        ) {
            return {
                userId: String(normalizedData),
            };
        }

        return {
            userId: String(
                normalizedData?.user_id ??
                    normalizedData?.userId ??
                    normalizedData?.UserId ??
                    normalizedData?.userID ??
                    normalizedData?.userid ??
                    normalizedData?.UserID ??
                    normalizedData?.id ??
                    ''
            ),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getUserIdByPhone.response');
        assertString(response.userId, 'getUserIdByPhone.response.userId', {
            allowEmpty: false,
        });
    }
}
