import { ProcessApiRequest } from './ProcessApiRequest';
import { assertArray, assertObject, assertString } from '../validation';

const normalizeSlotItem = (item) => ({
    name: String(item?.name ?? item?.label ?? item?.title ?? ''),
    slotId: String(item?.slot_id ?? item?.slotId ?? item?.id ?? ''),
});

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).map(([id, name]) =>
            name && typeof name === 'object'
                ? {
                      id,
                      ...name,
                  }
                : {
                      id,
                      name,
                  }
        );
    }

    return [];
};

export class GetUnplannedVisitSlotsRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_unplanned_visit_slots';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.date || this.params.selections?.warehouse || '';
    }

    buildProcessParams() {
        return {
            date: String(this.params.date || ''),
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
            selections: JSON.stringify(this.params.selections || {}),
        };
    }

    buildMockResponse() {
        return {
            slots: [
                {
                    name: '10:00 - 12:00',
                    slotId: 'unplanned-10-12',
                },
                {
                    name: '14:00 - 16:00',
                    slotId: 'unplanned-14-16',
                },
                {
                    name: '18:00 - 20:00',
                    slotId: 'unplanned-18-20',
                },
            ],
        };
    }

    transformEnvelopeData(data) {
        const rawSlots = Array.isArray(data)
            ? data
            : toArray(data?.slots ?? data?.items ?? data);

        return {
            slots: rawSlots
                .map(normalizeSlotItem)
                .filter((item) => item.name && item.slotId),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getUnplannedVisitSlots.response');
        assertArray(response.slots, 'getUnplannedVisitSlots.response.slots');

        response.slots.forEach((slot, index) => {
            const path = `getUnplannedVisitSlots.response.slots[${index}]`;
            assertObject(slot, path);
            assertString(slot.name, `${path}.name`, { allowEmpty: false });
            assertString(slot.slotId, `${path}.slotId`, {
                allowEmpty: false,
            });
        });
    }
}
