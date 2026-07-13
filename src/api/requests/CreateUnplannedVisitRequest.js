import { ProcessApiRequest } from './ProcessApiRequest';
import { assertBoolean, assertObject, assertString } from '../validation';

export class CreateUnplannedVisitRequest extends ProcessApiRequest {
    get processMethod() {
        return 'create_unplanned_visit';
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
            visit_purposes: this.params.purposes || [],
        };
    }

    buildMockResponse() {
        return {
            message: 'Незапланированный визит создан',
            ok: true,
            reservationId: String(this.params.reservationId || ''),
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
            reservationId: String(
                normalizedData?.reservation_id ??
                    normalizedData?.reservationId ??
                    this.params.reservationId ??
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
        // assertString(
        //     response.reservationId,
        //     'createUnplannedVisit.response.reservationId',
        //     { allowEmpty: false }
        // );
        // assertString(response.tvsId, 'createUnplannedVisit.response.tvsId', {
        //     allowEmpty: false,
        // });
    }
}
