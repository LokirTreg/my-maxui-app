import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const server = await createServer({ server: { host: '127.0.0.1', port: 5174, strictPort: false } });
await server.listen();
const requests = await server.ssrLoadModule('/src/api/processRequests.js');
const mocks = {};
for (const Request of Object.values(requests)) {
    try {
        const request = new Request({ slotId: 'slot-1', reservationId: 'reserve-1' });
        mocks[request.processMethod] = () => request.buildMockResponse();
    } catch { /* Abstract request classes have no process method. */ }
}
// HTTP representation differs from the transformed mock response.
mocks.check_self_registration = () => [{ is_registered: true }];
const executablePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean).find(existsSync);
let browser;
try {
    browser = await chromium.launch({ executablePath, headless: true });
    for (const role of ['drv', 'sto']) {
        const page = await browser.newPage();
        page.setDefaultTimeout(10000);
        const calls = [];
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://st.max.ru/**', route => route.fulfill({ body: '' }));
        await page.addInitScript(() => { window.WebApp = { initDataUnsafe: { user: { id: '123456' } } }; });
        await page.route('https://tsm.ant-tech.ru/**', async route => {
            const request = route.request();
            const url = new URL(request.url());
            const method = url.searchParams.get('method');
            const params = request.method() === 'POST' ? request.postDataJSON().data : Object.fromEntries(url.searchParams);
            calls.push({ method, params });
            const data = method === 'get_user_by_phone'
                ? { userid: '7151', role, maxid: '123456', phone: '79990000000' }
                : mocks[method]?.();
            assert.notEqual(data, undefined, `Missing mock: ${method}`);
            await route.fulfill({ json: { success: true, message: 'OK', timestamp: new Date().toISOString(), data } });
        });
        await page.goto(server.resolvedUrls.local[0]);
        const menu = role === 'drv' ? 'Регистрация' : 'Зарегистрировать визит';
        await page.getByRole('button', { name: menu, exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: role === 'drv' ? 'Зарегистрировать визит' : 'Регистрация', exact: true }).count(), 0);
        await page.getByRole('button', { name: 'История визитов', exact: true }).click();
        await page.getByRole('button', { name: '#132 12.05.2026', exact: true }).waitFor();
        const history = calls.find(call => call.method === 'get_visit_history');
        assert.equal(history.params.user_id, '7151');
        assert.equal(history.params.role, role);
        assert.equal(history.params.phone, undefined);
        await page.getByRole('button', { name: 'Домой', exact: true }).click();
        await page.getByRole('button', { name: menu, exact: true }).click();
        if (role === 'sto') {
            assert.equal(calls.filter(call => call.method === 'check_self_registration').length, 0);
            await page.locator('input[name=phone]').fill('123');
            await page.locator('button[type=submit]').click();
            assert.equal(calls.filter(call => call.method === 'get_unplanned_visit_form').length, 0);
            await page.locator('input[name=phone]').fill('+79649932510');
            await page.locator('button[type=submit]').click();
        }
        await page.locator('select').first().waitFor();
        const targetPhone = role === 'sto' ? '79649932510' : '79990000000';
        const formCall = calls.find(call => call.method === 'get_unplanned_visit_form');
        assert.equal(formCall.params.phone, targetPhone);
        assert.equal(formCall.params.user_id, '7151');
        assert.equal(formCall.params.max_user_id, '123456');
        if (role === 'sto') {
            for (const select of await page.locator('select').all()) await select.selectOption({ index: 1 });
            await page.getByRole('button', { name: '28.07.2026', exact: true }).click();
            await page.locator('.slot-list').nth(1).getByRole('button').first().click();
            await page.getByRole('button', { name: 'Подтвердить время', exact: true }).click();
            await page.locator('#creation-field-driver_name').waitFor();
            await page.reload();
            await page.locator('#creation-field-driver_name').fill('Тестовый водитель');
            await page.locator('#creation-field-vehicle_number').fill('А123АА');
            await page.getByRole('radio', { name: 'Выгрузка', exact: true }).check();
            await page.locator('button[type=submit]').click();
            await page.waitForURL('**/visit/9001');
            for (const method of ['get_unplanned_visit_dates', 'get_unplanned_visit_slots', 'reserve_unplanned_visit_slot', 'get_unplanned_visit_creation_form', 'update_visit']) {
                const matching = calls.filter(call => call.method === method);
                assert.ok(matching.length > 0, method);
                for (const call of matching) {
                    assert.equal(call.params.phone, targetPhone, method);
                    assert.equal(call.params.max_user_id, '123456', method);
                }
            }
            assert.equal(calls.filter(call => call.method === 'reserve_unplanned_visit_slot').length, 1);
            assert.equal(calls.filter(call => call.method === 'update_visit').length, 1);
        }
        assert.deepEqual(errors, []);
        console.log(`PASS ${role}: menu, history identity, visitor phone${role === 'sto' ? ', reservation, reload and update' : ''}`);
        await page.close();
    }
} finally {
    await browser?.close();
    await server.close();
}
