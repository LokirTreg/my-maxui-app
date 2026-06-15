import { ProcessApiRequest } from './ProcessApiRequest';
import { assertBoolean, assertObject, assertString } from '../validation';

export class ChangeVisitSlotRequest extends ProcessApiRequest {
    get processMethod() {
        return 'change_visit_slot';
    }

    getMockFailureKey() {
        return this.params.slotId;
    }

    buildProcessParams() {
        return {
            slot_id: String(this.params.slotId || ''),
            tvsid: String(this.params.tvsId || ''),
        };
    }

    buildMockResponse() {
        return {
            ok: true,
            message: 'Время визита изменено',
            slotId: String(this.params.slotId || ''),
        };
    }

    transformEnvelopeData(data, envelope) {
        const normalizedData = Array.isArray(data) ? data[0] : data;

        return {
            message: String(
                normalizedData?.message ||
                    normalizedData?.Message ||
                    envelope.message ||
                    'Время визита изменено'
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
        };
    }

    validateResponse(response) {
        assertObject(response, 'changeVisitSlot.response');
        assertBoolean(response.ok, 'changeVisitSlot.response.ok');
        assertString(response.message, 'changeVisitSlot.response.message', {
            allowEmpty: false,
        });
        assertString(response.slotId, 'changeVisitSlot.response.slotId', {
            allowEmpty: false,
        });
    }
}
