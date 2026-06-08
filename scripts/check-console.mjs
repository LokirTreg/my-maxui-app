import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const chromeCandidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);

const executablePath = chromeCandidates.find((path) => existsSync(path));

if (!executablePath) {
    console.error(
        'Chrome or Edge was not found. Set CHROME_PATH to a Chromium-based browser.'
    );
    process.exit(1);
}

const server = await createServer({
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: false,
    },
});

await server.listen();

const localUrl = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5173/';
const consoleErrors = [];
const pageErrors = [];
const routes = [
    '/',
    '/history',
    '/visit/132',
    '/change-time?tvsid=123',
];

const browser = await chromium.launch({
    executablePath,
    headless: true,
});

try {
    const page = await browser.newPage();

    page.on('console', (message) => {
        if (message.type() === 'error') {
            consoleErrors.push(message.text());
        }
    });

    page.on('pageerror', (error) => {
        pageErrors.push(error.message);
    });

    for (const route of routes) {
        const url = new URL(route, localUrl).toString();
        const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 15000,
        });

        await page.waitForTimeout(800);

        console.log(`Checked ${url}`);
        console.log(`HTTP ${response?.status() ?? 'unknown'}`);
    }

    const failures = [...pageErrors, ...consoleErrors];

    if (failures.length > 0) {
        console.error('Browser console errors:');
        failures.forEach((failure) => console.error(`- ${failure}`));
        process.exitCode = 1;
    } else {
        console.log('No browser console errors.');
    }
} finally {
    await browser.close();
    await server.close();
}
