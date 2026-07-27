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

export function saveMockPhoneByMaxUserId(maxUserId, phone, userId) {
    const maxId = String(maxUserId || '');
    const normalizedPhone = String(phone || '');
    const normalizedUserId = String(userId || '');

    if (maxId && normalizedPhone && normalizedUserId) {
        usersByMaxUserId.set(maxId, {
            phone: normalizedPhone,
        });
    }

    return {
        ok: Boolean(maxId && normalizedPhone && normalizedUserId),
        phone: normalizedPhone,
    };
}
