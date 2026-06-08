import { ProcessApiRequest } from './ProcessApiRequest';
import { saveMockPhoneByMaxUserId } from './mockPhoneStore';
import { assertBoolean, assertObject, assertString } from '../validation';

export class SavePhoneByMaxUserIdRequest extends ProcessApiRequest {
    get processMethod() {
        return 'save_phone_by_max_user_id';
    }

    getMockFailureKey() {
        return this.params.maxUserId;
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
        };
    }

    buildMockResponse() {
        return saveMockPhoneByMaxUserId(
            this.params.maxUserId,
            this.params.phone
        );
    }

    transformEnvelopeData(data, envelope) {
        const normalizedData = Array.isArray(data) ? data[0] : data;

        return {
            ok: Boolean(normalizedData?.ok ?? envelope.success),
            phone: String(normalizedData?.phone ?? this.params.phone ?? ''),
        };
    }

    validateResponse(response) {
        assertObject(response, 'savePhoneByMaxUserId.response');
        assertBoolean(response.ok, 'savePhoneByMaxUserId.response.ok');
        assertString(response.phone, 'savePhoneByMaxUserId.response.phone');
    }
}
