import { Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    executeCallback,
    getVisitActionButtons,
    getVisitFields,
    getWarehouseContacts,
} from '../api/processApi';
import { ActionButtons } from './ActionButtons';
import { ErrorMessage } from './ErrorMessage';
import { Loading } from './Loading';
import { VisitFields } from './VisitFields';
import { WarehouseContacts } from './WarehouseContacts';
import { useDevLog } from '../logs/useDevLog';

const createInitialState = () => ({
    actions: [],
    contacts: [],
    error: '',
    fields: [],
    loading: true,
});

export function VisitInfo({ title, tvsId }) {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState(createInitialState);
    const [statusMessage, setStatusMessage] = useState('');
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        let isActive = true;

        async function loadVisit() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            addLog('info', `Загрузка данных визита ${tvsId}`);

            setState((current) => ({
                ...current,
                error: '',
                loading: true,
            }));

            try {
                const [fieldsResult, actionsResult, contactsResult] =
                    await Promise.all([
                        getVisitFields(tvsId),
                        getVisitActionButtons(tvsId),
                        getWarehouseContacts(tvsId),
                    ]);

                if (!isActive) {
                    return;
                }

                setState({
                    actions: actionsResult.buttons || [],
                    contacts: contactsResult.fields || [],
                    error: '',
                    fields: fieldsResult.fields || [],
                    loading: false,
                });

                addLog(
                    'info',
                    `Визит ${tvsId}: поля ${
                        fieldsResult.fields?.length || 0
                    }, кнопки ${actionsResult.buttons?.length || 0}, контакты ${
                        contactsResult.fields?.length || 0
                    }`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                setState({
                    actions: [],
                    contacts: [],
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Не удалось загрузить данные визита',
                    fields: [],
                    loading: false,
                });

                addLog(
                    'error',
                    `Ошибка загрузки визита ${tvsId}: ${
                        error instanceof Error ? error.message : 'unknown'
                    }`
                );
            }
        }

        loadVisit();

        return () => {
            isActive = false;
        };
    }, [addLog, reloadKey, tvsId]);

    const handleCallback = async (callback, actionIndex) => {
        setPendingAction(actionIndex);
        setStatusMessage('');
        addLog('action', `executeCallback: ${callback}`);

        try {
            const options = {
                mode: 'http'
            };
            const result = await executeCallback(callback, options);
            setStatusMessage(result.message);
            addLog('info', `Callback выполнен: ${result.message}`);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось выполнить команду';

            setStatusMessage(message);
            addLog('error', `Callback ошибка: ${message}`);
        } finally {
            setPendingAction(null);
        }
    };

    const handleInternal = (internal) => {
        addLog('action', `internal action: ${internal}`);

        if (internal === 'changetime') {
            const params = new URLSearchParams({
                tvsid: tvsId,
            });

            navigate(`/change-time?${params.toString()}`);
            return;
        }

        setStatusMessage('Действие пока недоступно');
    };

    if (state.loading) {
        return <Loading text="Загружаем данные визита..." />;
    }

    if (state.error) {
        return (
            <ErrorMessage
                message={state.error}
                onRetry={() => setReloadKey((key) => key + 1)}
            />
        );
    }

    return (
        <div className="visit-info">
            <Panel className="section">
                <h2 className="section-title">Кнопки визита</h2>
                <ActionButtons
                    buttons={state.actions}
                    onCallback={handleCallback}
                    onInternal={handleInternal}
                    pendingAction={pendingAction}
                />
                {statusMessage && (
                    <p className="status-message">
                        {statusMessage}
                    </p>
                )}
            </Panel>

            <Panel className="section">
                <div className="section-header">
                    <h2 className="section-title">
                        {title}
                    </h2>
                    <span className="visit-id">ID {tvsId}</span>
                </div>
                <VisitFields fields={state.fields} />
            </Panel>

            <Panel className="section">
                <h2 className="section-title">
                    Контакты склада
                </h2>
                <WarehouseContacts fields={state.contacts} />
            </Panel>
        </div>
    );
}
