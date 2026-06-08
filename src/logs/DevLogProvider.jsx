import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DevLogContext } from './devLogContext';
import {
    clearCapturedConsoleEntries,
    subscribeConsoleCapture,
} from './consoleCapture';

const formatTime = (timestamp = Date.now()) =>
    new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(timestamp));

export function DevLogProvider({ children }) {
    const [logs, setLogs] = useState([]);
    const capturedLogIdsRef = useRef(new Set());

    const addLog = useCallback((level, message) => {
        setLogs((current) =>
            [
                {
                    id: `${Date.now()}-${Math.random()}`,
                    level,
                    message,
                    time: formatTime(),
                },
                ...current,
            ].slice(0, 80)
        );
    }, []);

    const addCapturedConsoleLog = useCallback((entry) => {
        if (capturedLogIdsRef.current.has(entry.id)) {
            return;
        }

        capturedLogIdsRef.current.add(entry.id);
        setLogs((current) =>
            [
                {
                    id: entry.id,
                    level: entry.level,
                    message: entry.message,
                    time: formatTime(entry.createdAt),
                },
                ...current,
            ].slice(0, 80)
        );
    }, []);

    const clearLogs = useCallback(() => {
        capturedLogIdsRef.current.clear();
        clearCapturedConsoleEntries();
        setLogs([]);
    }, []);

    useEffect(
        () => subscribeConsoleCapture(addCapturedConsoleLog),
        [addCapturedConsoleLog]
    );

    const value = useMemo(
        () => ({
            addLog,
            clearLogs,
            logs,
        }),
        [addLog, clearLogs, logs]
    );

    return (
        <DevLogContext.Provider value={value}>
            {children}
        </DevLogContext.Provider>
    );
}
