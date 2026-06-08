import { ProcessApiRequest } from './ProcessApiRequest';
import { getMockPhoneByMaxUserId } from './mockPhoneStore';
import { assertObject, assertString } from '../validation';

export class GetPhoneByMaxUserIdRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_phone_by_max_user_id';
    }

    getMockFailureKey() {
        return this.params.maxUserId;
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
        };
    }

    buildMockResponse() {
        return {
            phone: getMockPhoneByMaxUserId(this.params.maxUserId),
        };
    }

    transformEnvelopeData(data) {
        if (Array.isArray(data)) {
            const [firstItem] = data;

            if (typeof firstItem === 'string') {
                return {
                    phone: firstItem,
                };
            }

            return {
                phone: String(firstItem?.phone || ''),
            };
        }

        if (typeof data === 'string') {
            return {
                phone: data,
            };
        }

        return {
            phone: String(data?.phone || ''),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getPhoneByMaxUserId.response');
        assertString(response.phone, 'getPhoneByMaxUserId.response.phone');
    }
}
