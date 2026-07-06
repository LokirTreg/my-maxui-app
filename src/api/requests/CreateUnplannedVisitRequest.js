import { ProcessApiRequest } from './ProcessApiRequest';
import { assertBoolean, assertObject, assertString } from '../validation';

export class CreateUnplannedVisitRequest extends ProcessApiRequest {
    get processMethod() {
        return 'create_unplanned_visit';
    }

    getMockFailureKey() {
        return this.params.slotId;
    }

    buildProcessParams() {
        return {
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
            selections: this.params.selections || {},
            slot_id: String(this.params.slotId || ''),
        };
    }

    buildMockResponse() {
        return {
            message: 'Незапланированный визит создан',
            ok: true,
            slotId: String(this.params.slotId || ''),
            tvsId: '9001',
        };
    }

    transformEnvelopeData(data, envelope) {
        const normalizedData = Array.isArray(data) ? data[0] : data;

        return {
            message: String(
                normalizedData?.message ||
                    normalizedData?.Message ||
                    envelope.message ||
                    'Незапланированный визит создан'
            ),
            ok: Boolean(
                normalizedData?.ok ??
                    normalizedData?.Success ??
                    normalizedData?.success ??
                    envelope.success
            ),
            slotId: String(
                normalizedData?.slot_id ??
                    normalizedData?.slotId ??
                    this.params.slotId ??
                    ''
            ),
            tvsId: String(
                normalizedData?.tvsid ??
                    normalizedData?.tvsId ??
                    normalizedData?.ID ??
                    normalizedData?.id ??
                    ''
            ),
        };
    }

    validateResponse(response) {
        assertObject(response, 'createUnplannedVisit.response');
        assertBoolean(response.ok, 'createUnplannedVisit.response.ok');
        assertString(response.message, 'createUnplannedVisit.response.message', {
            allowEmpty: false,
        });
        assertString(response.slotId, 'createUnplannedVisit.response.slotId', {
            allowEmpty: false,
        });
        assertString(response.tvsId, 'createUnplannedVisit.response.tvsId', {
            allowEmpty: false,
        });
    }
}
