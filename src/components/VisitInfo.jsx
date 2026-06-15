import { Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    executeCallback,
    getVisitActionButtons,
    getVisitFields,
    getWarehouseContacts,
} from '../api/processApi';
import { getRequestOptions, isMockApiMode } from '../api/requestOptions';
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

const requestOptions = getRequestOptions();

const getLogErrorMessage = (error, fallback = 'unknown') =>
    error instanceof Error ? error.message : fallback;

const getUserErrorMessage = (error, fallback) => {
    if (error instanceof Error && error.name === 'ApiRequestError') {
        return `${fallback}. Подробности в логах.`;
    }

    return error instanceof Error ? error.message : fallback;
};

const addMockParam = (path) => {
    if (!isMockApiMode()) {
        return path;
    }

    const [pathname, query = ''] = path.split('?');
    const params = new URLSearchParams(query);
    params.set('mock', '1');

    return `${pathname}?${params.toString()}`;
};

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
                        getVisitFields(tvsId, requestOptions),
                        getVisitActionButtons(tvsId, requestOptions),
                        getWarehouseContacts(tvsId, requestOptions),
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
                    error: getUserErrorMessage(
                        error,
                        'Не удалось загрузить данные визита'
                    ),
                    fields: [],
                    loading: false,
                });

                addLog(
                    'error',
                    `Ошибка загрузки визита ${tvsId}: ${getLogErrorMessage(
                        error
                    )}`
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
            const result = await executeCallback(callback, requestOptions);
            setStatusMessage(result.message);
            addLog('info', `Callback выполнен: ${result.message}`);
        } catch (error) {
            const message = getUserErrorMessage(
                error,
                'Не удалось выполнить команду'
            );

            setStatusMessage(message);
            addLog('error', `Callback ошибка: ${getLogErrorMessage(error)}`);
        } finally {
            setPendingAction(null);
        }
    };

    const buildNavigationPath = (button) => {
        const rawPath = button.callback || '';

        if (rawPath) {
            return addMockParam(
                rawPath.replace('{tvsid}', encodeURIComponent(tvsId))
            );
        }

        const page = button.page || button.internal;

        if (page === 'changetime' || page === 'change-time') {
            const params = new URLSearchParams({
                tvsid: tvsId,
            });

            if (isMockApiMode()) {
                params.set('mock', '1');
            }

            return `/change-time?${params.toString()}`;
        }

        if (page === 'history') {
            return addMockParam('/history');
        }

        if (page === 'home') {
            return addMockParam(`/?tvsid=${encodeURIComponent(tvsId)}`);
        }

        return '';
    };

    const handleNavigate = (button) => {
        const path = buildNavigationPath(button);
        addLog('action', `app navigation: ${button.callback || ''}`);

        if (path) {
            navigate(path);
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
                    onNavigate={handleNavigate}
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
