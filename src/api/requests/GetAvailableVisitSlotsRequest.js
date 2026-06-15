import { ProcessApiRequest } from './ProcessApiRequest';
import { assertArray, assertObject, assertString } from '../validation';

const normalizeSlotItem = (item) => ({
    name: String(item?.name ?? ''),
    slotId: String(item?.slot_id ?? ''),
});

export class GetAvailableVisitSlotsRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_available_visit_slots';
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
            tvsid: String(this.params.tvsId || ''),
        };
    }

    buildMockResponse() {
        return {
            slots: [
                {
                    name: '09:00-11:00',
                    slotId: 'slot-09-11',
                },
                {
                    name: '12:00-14:00',
                    slotId: 'slot-12-14',
                },
                {
                    name: '15:00-17:00',
                    slotId: 'slot-15-17',
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        const rawSlots = Array.isArray(data)
            ? data
            : data?.slots ?? data?.items ?? [];

        return {
            slots: rawSlots
                .map(normalizeSlotItem)
                .filter((item) => item.name && item.slotId),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getAvailableVisitSlots.response');
        assertArray(response.slots, 'getAvailableVisitSlots.response.slots');

        response.slots.forEach((slot, index) => {
            const path = `getAvailableVisitSlots.response.slots[${index}]`;
            assertObject(slot, path);
            assertString(slot.name, `${path}.name`, { allowEmpty: false });
            assertString(slot.slotId, `${path}.slotId`, {
                allowEmpty: false,
            });
        });
    }
}
