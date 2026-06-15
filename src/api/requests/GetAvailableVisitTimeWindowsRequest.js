import { ProcessApiRequest } from './ProcessApiRequest';
import {
    assertArray,
    assertObject,
    assertOptionalString,
    assertString,
} from '../validation';

const getWindowId = (item, index) =>
    String(
        item?.id ??
            item?.ID ??
            item?.value ??
            item?.time ??
            item?.window ??
            index
    );

const getWindowValue = (item, id) =>
    String(item?.value ?? item?.time ?? item?.window ?? item?.val ?? id);

const getWindowLabel = (item, value) =>
    String(item?.label ?? item?.text ?? item?.title ?? item?.name ?? value);

const normalizeWindowItem = (item, index) => {
    if (typeof item === 'string') {
        return {
            id: item,
            label: item,
            value: item,
        };
    }

    const id = getWindowId(item, index);
    const value = getWindowValue(item, id);

    return {
        from: item?.from ? String(item.from) : undefined,
        id,
        label: getWindowLabel(item, value),
        to: item?.to ? String(item.to) : undefined,
        value,
    };
};

export class GetAvailableVisitTimeWindowsRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_available_visit_time_windows';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.date || this.params.tvsId;
    }

    buildProcessParams() {
        return {
            date: String(this.params.date || ''),
            phone: String(this.params.phone || ''),
            tvsid: String(this.params.tvsId || ''),
        };
    }

    buildMockResponse() {
        return {
            windows: [
                {
                    id: '09:00-11:00',
                    label: '09:00-11:00',
                    value: '09:00-11:00',
                },
                {
                    id: '12:00-14:00',
                    label: '12:00-14:00',
                    value: '12:00-14:00',
                },
                {
                    id: '15:00-17:00',
                    label: '15:00-17:00',
                    value: '15:00-17:00',
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        const rawWindows = Array.isArray(data)
            ? data
            : data?.windows ?? data?.timeWindows ?? data?.items ?? [];

        return {
            windows: rawWindows
                .map(normalizeWindowItem)
                .filter((item) => item.id && item.value),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getAvailableVisitTimeWindows.response');
        assertArray(
            response.windows,
            'getAvailableVisitTimeWindows.response.windows'
        );

        response.windows.forEach((windowItem, index) => {
            const path = `getAvailableVisitTimeWindows.response.windows[${index}]`;
            assertObject(windowItem, path);
            assertString(windowItem.id, `${path}.id`, { allowEmpty: false });
            assertString(windowItem.label, `${path}.label`, {
                allowEmpty: false,
            });
            assertString(windowItem.value, `${path}.value`, {
                allowEmpty: false,
            });
            assertOptionalString(windowItem.from, `${path}.from`);
            assertOptionalString(windowItem.to, `${path}.to`);
        });
    }
}
