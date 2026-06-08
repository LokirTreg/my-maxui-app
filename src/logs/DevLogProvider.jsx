import { useCallback, useMemo, useState } from 'react';

import { DevLogContext } from './devLogContext';

const formatTime = () =>
    new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date());

export function DevLogProvider({ children }) {
    const [logs, setLogs] = useState([]);

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

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

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
