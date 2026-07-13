import { ProcessApiRequest } from './ProcessApiRequest';
import { getMockUserByMaxUserId } from './mockPhoneStore';
import { assertObject, assertString } from '../validation';

export class GetPhoneByMaxUserIdRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_phone_by_max_user_id';
    }

    get method() {
        return 'GET';
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
        return getMockUserByMaxUserId(this.params.maxUserId);
    }

    transformEnvelopeData(data) {
        if (Array.isArray(data)) {
            const [firstItem] = data;

            if (typeof firstItem === 'string') {
                return {
                    phone: firstItem,
                    userId: '',
                };
            }

            return {
                phone: String(firstItem?.phone || ''),
                userId: String(
                    firstItem?.user_id ??
                        firstItem?.userId ??
                        firstItem?.UserId ??
                        firstItem?.userID ??
                        firstItem?.userid ??
                        firstItem?.UserID ??
                        firstItem?.id ??
                        ''
                ),
            };
        }

        if (typeof data === 'string') {
            return {
                phone: data,
                userId: '',
            };
        }

        return {
            phone: String(data?.phone || ''),
            userId: String(
                data?.user_id ??
                    data?.userId ??
                    data?.UserId ??
                    data?.userID ??
                    data?.userid ??
                    data?.UserID ??
                    data?.id ??
                    ''
            ),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getPhoneByMaxUserId.response');
        assertString(response.phone, 'getPhoneByMaxUserId.response.phone');
        assertString(response.userId, 'getPhoneByMaxUserId.response.userId', {
            allowEmpty: false,
        });
    }
}
