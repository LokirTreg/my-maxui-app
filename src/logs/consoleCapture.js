const BUFFER_LIMIT = 120;
const GLOBAL_KEY = '__myMaxuiConsoleCapture';
const MESSAGE_LIMIT = 4000;
const METHODS = ['debug', 'error', 'info', 'log', 'warn'];

function getCaptureState() {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!window[GLOBAL_KEY]) {
        window[GLOBAL_KEY] = {
            entries: [],
            installed: false,
            listeners: new Set(),
            nextId: 1,
            originals: {},
        };
    }

    return window[GLOBAL_KEY];
}

function truncateMessage(message) {
    if (message.length <= MESSAGE_LIMIT) {
        return message;
    }

    return `${message.slice(0, MESSAGE_LIMIT)}...`;
}

function stringifyObject(value) {
    const seen = new WeakSet();

    return JSON.stringify(value, (_key, currentValue) => {
        if (currentValue instanceof Error) {
            return currentValue.stack || currentValue.message;
        }

        if (typeof currentValue === 'bigint') {
            return `${currentValue.toString()}n`;
        }

        if (typeof currentValue === 'function') {
            return `[Function ${currentValue.name || 'anonymous'}]`;
        }

        if (typeof currentValue === 'symbol') {
            return currentValue.toString();
        }

        if (currentValue && typeof currentValue === 'object') {
            if (seen.has(currentValue)) {
                return '[Circular]';
            }

            seen.add(currentValue);
        }

        return currentValue;
    });
}

function formatValue(value) {
    if (value instanceof Error) {
        return value.stack || value.message;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (value === undefined) {
        return 'undefined';
    }

    if (value === null) {
        return 'null';
    }

    if (typeof value === 'object') {
        try {
            return stringifyObject(value);
        } catch {
            return String(value);
        }
    }

    return String(value);
}

function formatArgs(args) {
    return truncateMessage(args.map(formatValue).join(' '));
}

function pushConsoleEntry(level, args) {
    const state = getCaptureState();

    if (!state) {
        return;
    }

    const entry = {
        createdAt: Date.now(),
        id: `console-${Date.now()}-${state.nextId}`,
        level,
        message: formatArgs(args),
    };

    state.nextId += 1;
    state.entries.push(entry);

    if (state.entries.length > BUFFER_LIMIT) {
        state.entries.splice(0, state.entries.length - BUFFER_LIMIT);
    }

    state.listeners.forEach((listener) => listener(entry));
}

function captureRuntimeError(event) {
    pushConsoleEntry('error', [event.message || 'Runtime error', event.error]);
}

function captureUnhandledRejection(event) {
    pushConsoleEntry('error', ['Unhandled promise rejection', event.reason]);
}

export function installConsoleCapture() {
    const state = getCaptureState();

    if (!state || state.installed) {
        return;
    }

    state.installed = true;

    METHODS.forEach((method) => {
        const original = window.console?.[method];

        if (typeof original !== 'function') {
            return;
        }

        state.originals[method] = original;
        window.console[method] = (...args) => {
            original.apply(window.console, args);
            pushConsoleEntry(method, args);
        };
    });

    window.addEventListener('error', captureRuntimeError);
    window.addEventListener('unhandledrejection', captureUnhandledRejection);
}

export function subscribeConsoleCapture(listener) {
    const state = getCaptureState();

    if (!state) {
        return () => {};
    }

    state.listeners.add(listener);
    state.entries.forEach((entry) => listener(entry));

    return () => {
        state.listeners.delete(listener);
    };
}

export function clearCapturedConsoleEntries() {
    const state = getCaptureState();

    if (state) {
        state.entries = [];
    }
}
