import { ProcessApiRequest } from './ProcessApiRequest';
import { assertObject, assertString } from '../validation';

export class UpdateVisitRequest extends ProcessApiRequest {
    get processMethod() {
        return 'update_visit';
    }

    getMockFailureKey() {
        return this.params.reservationId;
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
            fields: this.params.fields || {},
            reservation_id: String(this.params.reservationId || ''),
            visit_purposes: String(this.params.purpose || ''),
        };
    }

    buildMockResponse() {
        return {
            tvsid: '9001',
        };
    }

    transformEnvelopeData(data) {
        const normalizedData = Array.isArray(data) ? data[0] : data;

        if (typeof normalizedData === 'string' || typeof normalizedData === 'number') {
            return {
                tvsid: String(normalizedData),
            };
        }

        return {
            tvsid: String(
                normalizedData?.tvsid ??
                    normalizedData?.tvsId ??
                    normalizedData?.ID ??
                    normalizedData?.id ??
                    ''
            ),
        };
    }

    validateResponse(response) {
        assertObject(response, 'updateVisit.response');
        assertString(response.tvsid, 'updateVisit.response.tvsid', {
            allowEmpty: false,
        });
    }
}
