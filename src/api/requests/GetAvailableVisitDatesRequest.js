import { ProcessApiRequest } from './ProcessApiRequest';
import { assertArray, assertObject, assertString } from '../validation';

const getDateValue = (item) =>
    String(item?.date ?? item?.day ?? item?.value ?? item?.val ?? '');

const getDateLabel = (item, date) =>
    String(item?.label ?? item?.text ?? item?.title ?? date);

const normalizeDateItem = (item) => {
    if (typeof item === 'string') {
        return {
            date: item,
            label: item,
        };
    }

    const date = getDateValue(item);

    return {
        date,
        label: getDateLabel(item, date),
    };
};

export class GetAvailableVisitDatesRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_available_visit_dates';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.tvsId;
    }

    buildProcessParams() {
        return {
            phone: String(this.params.phone || ''),
            tvsid: String(this.params.tvsId || ''),
        };
    }

    buildMockResponse() {
        return {
            dates: [
                {
                    date: '2026-06-16',
                    label: '16.06.2026',
                },
                {
                    date: '2026-06-17',
                    label: '17.06.2026',
                },
                {
                    date: '2026-06-18',
                    label: '18.06.2026',
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        const rawDates = Array.isArray(data)
            ? data
            : data?.dates ?? data?.items ?? [];

        return {
            dates: rawDates.map(normalizeDateItem).filter((item) => item.date),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getAvailableVisitDates.response');
        assertArray(response.dates, 'getAvailableVisitDates.response.dates');

        response.dates.forEach((dateItem, index) => {
            const path = `getAvailableVisitDates.response.dates[${index}]`;
            assertObject(dateItem, path);
            assertString(dateItem.date, `${path}.date`, {
                allowEmpty: false,
            });
            assertString(dateItem.label, `${path}.label`, {
                allowEmpty: false,
            });
        });
    }
}
