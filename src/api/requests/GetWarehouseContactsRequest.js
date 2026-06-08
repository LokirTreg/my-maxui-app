import { ProcessApiRequest } from './ProcessApiRequest';
import { normalizeId } from './normalizeId';
import {
    assertArray,
    assertObject,
    assertOptionalString,
    assertString,
} from '../validation';

export class GetWarehouseContactsRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_warehouse_contacts';
    }

    getMockFailureKey() {
        return this.params.tvsId;
    }

    buildProcessParams() {
        return {
            tvsid: normalizeId(this.params.tvsId),
        };
    }

    buildMockResponse() {
        const id = normalizeId(this.params.tvsId);

        return {
            fields: [
                {
                    text: 'Адрес склада: Москва, ул. Тимирязевская, д. 1',
                    cssclass: 'frm_footer',
                },
                {
                    text: 'Телефон: 8 901 234 5678',
                    cssclass: 'frm_footer',
                },
                {
                    text: `Код визита для охраны: ${id}`,
                    cssclass: 'frm_footer',
                },
            ],
        };
    }

    validateResponse(response) {
        assertObject(response, 'getWarehouseContacts.response');
        assertArray(response.fields, 'getWarehouseContacts.response.fields');

        response.fields.forEach((field, index) => {
            const path = `getWarehouseContacts.response.fields[${index}]`;
            assertObject(field, path);
            assertString(field.text, `${path}.text`);
            assertOptionalString(field.cssclass, `${path}.cssclass`);
        });
    }
}
