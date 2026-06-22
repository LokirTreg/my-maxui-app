import { ProcessApiRequest } from './ProcessApiRequest';
import { normalizeId } from './normalizeId';
import {
    assertArray,
    assertObject,
    assertOptionalString,
    assertString,
} from '../validation';

export class GetVisitFieldsRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_visit_fields';
    }

    get method() {
        return 'GET';
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
                    title: 'Номер визита',
                    title_cssclass: 'frm_title_norm',
                    val: id,
                    val_cssclass: 'frm_val_norm',
                },
                {
                    title: 'Номер ворот',
                    title_cssclass: 'frm_title_norm',
                    val: String((Number.parseInt(id, 10) % 7) + 1 || 5),
                    val_cssclass: 'frm_val_border frm_val_bold',
                },
                {
                    title: 'Дата и время',
                    title_cssclass: 'frm_title_norm',
                    val: '02.06.2026 14:30',
                    val_cssclass: 'frm_val_norm',
                },
                {
                    title: 'Статус',
                    title_cssclass: 'frm_title_norm',
                    val: 'Ожидает прибытия',
                    val_cssclass: 'frm_val_bold',
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        if (Array.isArray(data)) {
            return {
                fields: data,
            };
        }

        return data;
    }

    validateResponse(response) {
        assertObject(response, 'getVisitFields.response');
        assertArray(response.data, 'getVisitFields.response.fields');

        response.data.forEach((field, index) => {
            const path = `getVisitFields.response.fields[${index}]`;
            assertObject(field, path);
            assertString(field.title, `${path}.title`);
            assertOptionalString(field.title_cssclass, `${path}.title_cssclass`);
            assertString(field.val, `${path}.val`);
            assertOptionalString(field.val_cssclass, `${path}.val_cssclass`);
        });
    }
}
