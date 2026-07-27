import { ProcessApiRequest } from './ProcessApiRequest';
import {
    assertArray,
    assertBoolean,
    assertObject,
    assertString,
} from '../validation';

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).map(([id, item]) =>
            item && typeof item === 'object' ? { id, ...item } : { id, name: item }
        );
    }

    return [];
};

const normalizeOption = (item) => {
    if (typeof item === 'string') {
        return { id: item, name: item };
    }

    const id = String(item?.id ?? item?.value ?? item?.code ?? item?.key ?? '');

    return {
        id,
        name: String(item?.name ?? item?.label ?? item?.title ?? item?.text ?? id),
    };
};

const normalizeFieldType = (value) => {
    const type = String(value ?? 'text').toLowerCase();
    const typeMap = {
        1: 'text',
        2: 'number',
        3: 'select',
        4: 'tel',
    };

    return typeMap[type] || type;
};

const normalizeField = (item) => {
    const id = String(item?.id ?? item?.key ?? item?.code ?? item?.name ?? '');

    return {
        canIgnoreMask: Boolean(
            item?.can_ignore_mask ?? item?.canIgnoreMask ?? item?.canignoremask
        ),
        hint: String(item?.hint ?? item?.description ?? item?.mask_text ?? ''),
        id,
        name: String(item?.name ?? item?.label ?? item?.title ?? id),
        options: toArray(item?.options ?? item?.values ?? item?.items)
            .map(normalizeOption)
            .filter((option) => option.id && option.name),
        placeholder: String(item?.placeholder ?? ''),
        required: Boolean(item?.required ?? item?.req),
        type: normalizeFieldType(item?.type),
    };
};

export class GetUnplannedVisitCreationFormRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_unplanned_visit_creation_form';
    }

    get method() {
        return 'GET';
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
            reservation_id: String(this.params.reservationId || ''),
        };
    }

    buildMockResponse() {
        const fields = [
            {
                id: 'driver_name',
                name: 'ФИО водителя',
                required: true,
                type: 'text',
            },
            {
                id: 'vehicle_number',
                name: 'Гос. номер ТС',
                required: true,
                type: 'text',
            },
        ].map((field) => ({
            canIgnoreMask: false,
            hint: '',
            options: [],
            placeholder: '',
            ...field,
        }));

        return {
            date: '13.07.2026',
            fields,
            time: '14:00 - 16:00',
        };
    }

    transformEnvelopeData(data) {
        const normalizedData = Array.isArray(data) ? data[0] : data || {};
        const rawFields = normalizedData.fields ?? normalizedData.items ?? [];

        return {
            date: String(
                normalizedData.date ??
                    normalizedData.visit_date ??
                    normalizedData.visitDate ??
                    ''
            ),
            fields: toArray(rawFields)
                .map(normalizeField)
                .filter((field) => field.id && field.name),
            time: String(
                normalizedData.time ??
                    normalizedData.slot_name ??
                    normalizedData.slotName ??
                    normalizedData.label ??
                    ''
            ),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getUnplannedVisitCreationForm.response');
        assertString(response.date, 'getUnplannedVisitCreationForm.response.date');
        assertString(response.time, 'getUnplannedVisitCreationForm.response.time');
        assertArray(response.fields, 'getUnplannedVisitCreationForm.response.fields');

        response.fields.forEach((field, index) => {
            const path = `getUnplannedVisitCreationForm.response.fields[${index}]`;
            assertObject(field, path);
            assertString(field.id, `${path}.id`, { allowEmpty: false });
            assertString(field.name, `${path}.name`, { allowEmpty: false });
            assertString(field.type, `${path}.type`, { allowEmpty: false });
            assertBoolean(field.required, `${path}.required`);
            assertBoolean(field.canIgnoreMask, `${path}.canIgnoreMask`);
            assertString(field.hint, `${path}.hint`);
            assertString(field.placeholder, `${path}.placeholder`);
            assertArray(field.options, `${path}.options`);
        });

    }
}
