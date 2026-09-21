import { ProcessApiRequest } from './ProcessApiRequest';
import { assertObject, assertString } from '../validation';

export class GetUserByPhoneRequest extends ProcessApiRequest {
    get processMethod() { return 'get_user_by_phone'; }
    get method() { return 'GET'; }

    buildProcessParams() {
        return { phone: String(this.params.phone || ''), maxId: String(this.params.maxId || '') };
    }

    validateParams(params) {
        if (!params.phone && !params.maxId) {
            throw new Error('Укажите телефон или MAX ID');
        }
    }

    transformEnvelopeData(data) {
        const row = Array.isArray(data) ? data[0] : data;
        assertObject(row, 'getUserByPhone.data');
        return {
            userid: String(row.userid ?? ''),
            role: String(row.role ?? ''),
            maxid: String(row.maxid ?? ''),
            phone: String(row.phone ?? ''),
        };
    }

    validateResponse(data) {
        assertObject(data, 'getUserByPhone.response');
        for (const field of ['userid', 'role', 'phone']) {
            assertString(data[field], `getUserByPhone.${field}`, { allowEmpty: false });
        }
        assertString(data.maxid, 'getUserByPhone.maxid');
    }

    buildMockResponse() {
        return { userid: 'mock-user', role: 'mock', maxid: this.params.maxId || '', phone: this.params.phone || '79990000000' };
    }
}
