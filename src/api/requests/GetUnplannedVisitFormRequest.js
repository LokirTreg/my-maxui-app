import { ProcessApiRequest } from './ProcessApiRequest';
import { assertArray, assertObject, assertString } from '../validation';

const getFieldId = (item) =>
    String(item?.id ?? item?.key ?? item?.code ?? item?.name ?? '');

const getFieldName = (item, id) =>
    String(item?.title ?? item?.label ?? item?.name ?? item?.text ?? id);

const getOptionId = (item) =>
    String(item?.id ?? item?.value ?? item?.code ?? item?.key ?? '');

const getOptionName = (item, id) =>
    String(item?.label ?? item?.name ?? item?.title ?? item?.text ?? id);

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).map(([id, name]) =>
            name && typeof name === 'object'
                ? {
                      id,
                      ...name,
                  }
                : {
                      id,
                      name,
                  }
        );
    }

    return [];
};

const normalizeOptionItem = (item) => {
    if (typeof item === 'string') {
        return {
            id: item,
            name: item,
        };
    }

    const id = getOptionId(item);

    return {
        id,
        name: getOptionName(item, id),
    };
};

const normalizeFieldItem = (item) => {
    const id = getFieldId(item);
    const rawOptions = toArray(item?.options ?? item?.values ?? item?.items);

    return {
        id,
        name: getFieldName(item, id),
        options: rawOptions
            .map(normalizeOptionItem)
            .filter((option) => option.id && option.name),
    };
};

const normalizeObjectMap = (data) =>
    Object.entries(data || {}).map(([id, value]) => ({
        id,
        name: String(value?.title ?? value?.label ?? value?.name ?? id),
        options: Array.isArray(value)
            ? value
            : toArray(value?.options ?? value?.items ?? value),
    }));

export class GetUnplannedVisitFormRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_unplanned_visit_form';
    }

    get method() {
        return 'GET';
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
        };
    }

    buildMockResponse() {
        return {
            fields: [
                {
                    id: 'warehouse',
                    name: 'Склад',
                    options: [
                        {
                            id: 'msk',
                            name: 'Москва, ул. Тихая, 12',
                        },
                        {
                            id: 'kaluga',
                            name: 'Калуга, промзона Северная',
                        },
                    ],
                },
                {
                    id: 'cargo_type',
                    name: 'Тип груза',
                    options: [
                        {
                            id: 'pallet',
                            name: 'Паллеты',
                        },
                        {
                            id: 'box',
                            name: 'Короба',
                        },
                    ],
                },
                {
                    id: 'transport_type',
                    name: 'Тип транспорта',
                    options: [
                        {
                            id: 'car',
                            name: 'Легковой',
                        },
                        {
                            id: 'truck',
                            name: 'Грузовой',
                        },
                    ],
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        const rawFields = Array.isArray(data)
            ? data
            : data?.fields ?? data?.selects ?? data?.items ?? data ?? [];
        const fields = Array.isArray(rawFields)
            ? rawFields
            : normalizeObjectMap(rawFields);

        return {
            fields: fields
                .map(normalizeFieldItem)
                .filter((field) => field.id && field.name),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getUnplannedVisitForm.response');
        assertArray(response.fields, 'getUnplannedVisitForm.response.fields');

        response.fields.forEach((field, fieldIndex) => {
            const fieldPath = `getUnplannedVisitForm.response.fields[${fieldIndex}]`;
            assertObject(field, fieldPath);
            assertString(field.id, `${fieldPath}.id`, { allowEmpty: false });
            assertString(field.name, `${fieldPath}.name`, {
                allowEmpty: false,
            });
            assertArray(field.options, `${fieldPath}.options`);

            field.options.forEach((option, optionIndex) => {
                const optionPath = `${fieldPath}.options[${optionIndex}]`;
                assertObject(option, optionPath);
                assertString(option.id, `${optionPath}.id`, {
                    allowEmpty: false,
                });
                assertString(option.name, `${optionPath}.name`, {
                    allowEmpty: false,
                });
            });
        });
    }
}
