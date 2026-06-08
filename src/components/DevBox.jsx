import { Button, Panel } from '@maxhub/max-ui';
import { useState } from 'react';

import { useDevLog } from '../logs/useDevLog';

export function DevBox() {
    const { clearLogs, logs } = useDevLog();
    const [isExpanded, setIsExpanded] = useState(() => {
        const savedState = window.localStorage.getItem('devBoxExpanded');
        return savedState === 'true';
    });

    const toggleExpanded = () => {
        setIsExpanded((current) => {
            const next = !current;
            window.localStorage.setItem('devBoxExpanded', String(next));
            return next;
        });
    };

    return (
        <Panel className={`dev-box ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {isExpanded && (
                <div className="dev-box-body">
                    {logs.length === 0 && (
                        <p className="dev-box-empty">Логов пока нет</p>
                    )}

                    {logs.map((log) => (
                        <div className="dev-log-line" key={log.id}>
                            <span className="dev-log-time">{log.time}</span>
                            <span className={`dev-log-label ${log.level}`}>
                                {log.level}
                            </span>
                            <span className="dev-log-message">
                                {log.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="dev-box-header">
                <Button
                    className="dev-box-toggle"
                    onClick={toggleExpanded}
                    title={isExpanded ? 'Свернуть логи' : 'Развернуть логи'}
                >
                    {isExpanded ? 'Логи -' : 'Логи +'}
                </Button>
                {isExpanded && (
                    <Button className="dev-box-clear" onClick={clearLogs}>
                        Очистить
                    </Button>
                )}
            </div>
        </Panel>
    );
}
