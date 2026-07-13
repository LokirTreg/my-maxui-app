const usersByMaxUserId = new Map([
    ['100500', { phone: '79012345678', userId: '501' }],
    ['254022815', { phone: '79012345678', userId: '502' }],
]);

export function getMockUserByMaxUserId(maxUserId) {
    const id = String(maxUserId || '');
    const storedUser = usersByMaxUserId.get(id);

    return {
        phone: storedUser?.phone || '',
        userId: storedUser?.userId || (id ? `mock-user-${id}` : ''),
    };
}

export function saveMockPhoneByMaxUserId(maxUserId, phone, userId) {
    const maxId = String(maxUserId || '');
    const normalizedPhone = String(phone || '');
    const normalizedUserId = String(userId || '');

    if (maxId && normalizedPhone && normalizedUserId) {
        usersByMaxUserId.set(maxId, {
            phone: normalizedPhone,
            userId: normalizedUserId,
        });
    }

    return {
        ok: Boolean(maxId && normalizedPhone && normalizedUserId),
        phone: normalizedPhone,
        userId: normalizedUserId,
    };
}
