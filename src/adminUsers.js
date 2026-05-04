export const ADMIN_USERS = [];

const normalizeId = (id) => String(id ?? '').trim();

const normalizePhone = (phone) => String(phone ?? '').replace(/[^\d+]/g, '');

export async function requestAdminUsers() {
    return ADMIN_USERS;
}

export function isAdminUser({ user, phone, admins }) {
    const userId = normalizeId(user?.id);
    const userPhone = normalizePhone(phone);

    if (!userId || !userPhone) {
        return false;
    }

    return admins.some((admin) => {
        const adminId = normalizeId(admin.maxUserId);
        const adminPhone = normalizePhone(admin.phone);

        return adminId === userId && adminPhone === userPhone;
    });
}
