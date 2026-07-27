import { ProcessApiRequest } from './ProcessApiRequest';
import { assertArray, assertObject, assertString } from '../validation';

const normalizeDateItem = (item) => {
    if (typeof item === 'string') {
        return {
            date: item,
            label: item,
        };
    }

    const date = String(
        item?.date ?? item?.day ?? item?.value ?? item?.val ?? ''
    );

    return {
        date,
        label: String(item?.label ?? item?.text ?? item?.title ?? date),
    };
};

export class GetUnplannedVisitDatesRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_unplanned_visit_dates';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.selections?.warehouse || '';
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
            selections: JSON.stringify(this.params.selections || {}),
            user_id: String(this.params.userId || ''),
        };
    }

    buildMockResponse() {
        return {
            dates: [
                {
                    date: '2026-07-28T00:00:00',
                    label: '28.07.2026',
                },
                {
                    date: '2026-07-29T00:00:00',
                    label: '29.07.2026',
                },
                {
                    date: '2026-07-30T00:00:00',
                    label: '30.07.2026',
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
        assertObject(response, 'getUnplannedVisitDates.response');
        assertArray(response.dates, 'getUnplannedVisitDates.response.dates');

        response.dates.forEach((dateItem, index) => {
            const path = `getUnplannedVisitDates.response.dates[${index}]`;
            assertObject(dateItem, path);
            assertString(dateItem.date, `${path}.date`, { allowEmpty: false });
            assertString(dateItem.label, `${path}.label`, { allowEmpty: false });
        });
    }
}
