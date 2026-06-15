export function isMockApiMode() {
    if (typeof window === 'undefined') {
        return false;
    }

    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('mock') === '1';
}

export function getRequestOptions() {
    return {
        mode: isMockApiMode() ? 'mock' : 'http',
    };
}
