import { ProcessApiRequest } from './ProcessApiRequest';
import { assertBoolean, assertObject, assertString } from '../validation';

export class ReserveUnplannedVisitSlotRequest extends ProcessApiRequest {
    get processMethod() {
        return 'reserve_unplanned_visit_slot';
    }

    getMockFailureKey() {
        return this.params.slotId;
    }

    buildProcessParams() {
        return {
            date: String(this.params.date || ''),
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
            selections: this.params.selections || {},
            slot_id: String(this.params.slotId || ''),
        };
    }

    buildMockResponse() {
        return {
            date: '13.07.2026',
            message: 'Время визита зарезервировано',
            ok: true,
            reservationId: 'reservation-9001',
            slotId: String(this.params.slotId || ''),
            time: '14:00 - 16:00',
            tvsId: '9001',
        };
    }

    transformEnvelopeData(data, envelope) {
        const normalizedData = Array.isArray(data) ? data[0] : data;

        return {
            date: String(
                normalizedData?.date ??
                    normalizedData?.visit_date ??
                    normalizedData?.visitDate ??
                    ''
            ),
            message: String(
                normalizedData?.message ||
                    normalizedData?.Message ||
                    envelope.message ||
                    'Время визита зарезервировано'
            ),
            ok: Boolean(
                normalizedData?.ok ??
                    normalizedData?.Success ??
                    normalizedData?.success ??
                    envelope.success
            ),
            reservationId: String(
                normalizedData?.reservation_id ??
                    normalizedData?.reservationId ??
                    normalizedData?.ID ??
                    normalizedData?.id ??
                    ''
            ),
            slotId: String(
                normalizedData?.slot_id ??
                    normalizedData?.slotId ??
                    this.params.slotId ??
                    ''
            ),
            time: String(
                normalizedData?.time ??
                    normalizedData?.slot_name ??
                    normalizedData?.slotName ??
                    normalizedData?.label ??
                    ''
            ),
            tvsId: String(
                normalizedData?.tvsid ??
                    normalizedData?.tvsId ??
                    normalizedData?.TVSID ??
                    normalizedData?.visit_id ??
                    normalizedData?.visitId ??
                    ''
            ),
        };
    }

    validateResponse(response) {
        assertObject(response, 'reserveUnplannedVisitSlot.response');
        assertBoolean(response.ok, 'reserveUnplannedVisitSlot.response.ok');
        assertString(
            response.message,
            'reserveUnplannedVisitSlot.response.message',
            { allowEmpty: false }
        );
        assertString(
            response.reservationId,
            'reserveUnplannedVisitSlot.response.reservationId'
        );
        assertString(response.slotId, 'reserveUnplannedVisitSlot.response.slotId', {
            allowEmpty: false,
        });
        assertString(response.date, 'reserveUnplannedVisitSlot.response.date');
        assertString(response.time, 'reserveUnplannedVisitSlot.response.time');
        assertString(response.tvsId, 'reserveUnplannedVisitSlot.response.tvsId', {
            allowEmpty: false,
        });
    }
}
