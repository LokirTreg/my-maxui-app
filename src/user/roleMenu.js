// Keys must be uro_Code values returned as role, not numeric tus_RoleID.
export const ROLE_MENUS = Object.freeze({});
export const DEFAULT_MENU = Object.freeze(['history', 'selfRegistration']);
export const MENU_ITEMS = Object.freeze({
    history: { title: 'История визитов', path: '/history' },
    selfRegistration: { title: 'Саморегистрация', path: '/unplanned-visit' },
});

export function getRoleMenu(role, menus = ROLE_MENUS) {
    const key = String(role ?? '');
    const ids = Object.hasOwn(menus, key) ? menus[key] : DEFAULT_MENU;
    return [...new Set(ids)].filter((id) => Object.hasOwn(MENU_ITEMS, id));
}
