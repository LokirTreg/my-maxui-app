const userPhonesByMaxUserId = new Map([['100500', '79012345678']]);

export function getMockPhoneByMaxUserId(maxUserId) {
    return userPhonesByMaxUserId.get(String(maxUserId || '')) || '';
}

export function saveMockPhoneByMaxUserId(maxUserId, phone) {
    const id = String(maxUserId || '');
    const normalizedPhone = String(phone || '');

    if (id && normalizedPhone) {
        userPhonesByMaxUserId.set(id, normalizedPhone);
    }

    return {
        ok: Boolean(id && normalizedPhone),
        phone: normalizedPhone,
    };
}
