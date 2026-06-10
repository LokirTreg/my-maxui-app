import { ProcessApiRequest } from './ProcessApiRequest';
import { assertObject, assertString } from '../validation';

const getVisitId = (value) =>
    String(
        value?.tvsid ??
            value?.tvs_id ??
            value?.tvsId ??
            value?.TvsId ??
            value?.ID ??
            value?.id ??
            ''
    );

export class GetActualVisitRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_actual_visit';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.phone || this.params.maxUserId;
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
        };
    }

    buildMockResponse() {
        return {
            tvsId: '',
        };
    }

    transformEnvelopeData(data) {
        if (typeof data === 'string' || typeof data === 'number') {
            return {
                tvsId: String(data),
                visit: null,
            };
        }

        const normalizedData = Array.isArray(data) ? data[0] : data;

        return {
            tvsId: getVisitId(normalizedData),
            visit: normalizedData || null,
        };
    }

    validateResponse(response) {
        assertObject(response, 'getActualVisit.response');
        assertString(response.tvsId, 'getActualVisit.response.tvsId');
    }
}
