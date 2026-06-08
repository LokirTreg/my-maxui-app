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

    validateResponse(response) {
        assertObject(response, 'getPhoneByMaxUserId.response');
        assertString(response.phone, 'getPhoneByMaxUserId.response.phone');
    }
}
