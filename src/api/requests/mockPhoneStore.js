const usersByMaxUserId = new Map([
    ['100500', { phone: '' }],
]);

export function getMockUserByMaxUserId(maxUserId) {
    const id = String(maxUserId || '');
    const storedUser = usersByMaxUserId.get(id);

    return {
        phone: storedUser?.phone || '',
    };
}

export function saveMockPhoneByMaxUserId(maxUserId, phone) {
    const maxId = String(maxUserId || '');
    const normalizedPhone = String(phone || '');

    if (maxId && normalizedPhone) {
        usersByMaxUserId.set(maxId, {
            phone: normalizedPhone,
        });
    }

    return {
        ok: Boolean(maxId && normalizedPhone),
        phone: normalizedPhone,
    };
}
