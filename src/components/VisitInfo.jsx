import { Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    executeCallback,
    getGeoPosition,
    getVisitActionButtons,
    getVisitFields,
    getWarehouseContacts,
} from '../api/processApi';
import { getRequestOptions, isMockApiMode } from '../api/requestOptions';
import { ActionButtons } from './ActionButtons';
import { ErrorMessage } from './ErrorMessage';
import { GeoPositionStatus } from './GeoPositionStatus';
import { Loading } from './Loading';
import { VisitFields } from './VisitFields';
import { WarehouseContacts } from './WarehouseContacts';
import { useDevLog } from '../logs/useDevLog';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const createInitialState = () => ({
    actions: [],
    contacts: [],
    error: '',
    fields: [],
    geo: null,
    geoError: '',
    loading: true,
});

const GEO_POSITION_ACTUALITY_MINUTES = 360;
const GEO_SHARE_TEXT = `/get_geo_position`;
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

const getWebApp = () =>
    typeof window !== 'undefined' && window.WebApp ? window.WebApp : null;

export function VisitInfo({ title, tvsId }) {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const { maxUserId, phone } = useMaxUserPhone();
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState(createInitialState);
    const [geoSharePending, setGeoSharePending] = useState(false);
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
                const geoRequest = getGeoPosition(
                    tvsId,
                    phone,
                    maxUserId,
                    GEO_POSITION_ACTUALITY_MINUTES,
                    requestOptions
                )
                    .then((result) => ({ result }))
                    .catch((error) => ({ error }));
                const [
                    fieldsResult,
                    actionsResult,
                    contactsResult,
                    geoResult,
                ] =
                    await Promise.all([
                        getVisitFields(tvsId, requestOptions),
                        getVisitActionButtons(tvsId, requestOptions),
                        getWarehouseContacts(tvsId, requestOptions),
                        geoRequest,
                    ]);

                if (!isActive) {
                    return;
                }

                const geoError = geoResult.error
                    ? 'Не удалось загрузить геопозицию'
                    : '';
                const geo = geoResult.result?.geo || null;

                if (geoResult.error) {
                    addLog(
                        'error',
                        `Ошибка геопозиции визита ${tvsId}: ${getLogErrorMessage(
                            geoResult.error
                        )}`
                    );
                } else {
                    addLog(
                        'info',
                        geo
                            ? `Геопозиция визита ${tvsId}: ${geo.latitude}, ${geo.longitude}`
                            : `Геопозиция визита ${tvsId} не сохранена`
                    );
                }

                setState({
                    actions: actionsResult.buttons || [],
                    contacts: contactsResult.fields || [],
                    error: '',
                    fields: fieldsResult.fields || [],
                    geo,
                    geoError,
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
                    geo: null,
                    geoError: '',
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
    }, [addLog, maxUserId, phone, reloadKey, tvsId]);

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

    const handleShareGeoRequest = async () => {
        setGeoSharePending(true);
        setStatusMessage('');
        addLog('action', `MAX Bridge: shareMaxContent(${GEO_SHARE_TEXT})`);

        try {
            const webApp = getWebApp();

            if (!webApp || typeof webApp.shareMaxContent !== 'function') {
                throw new Error('MAX Bridge shareMaxContent недоступен');
            }

            const result = await webApp.shareMaxContent({
                text: GEO_SHARE_TEXT,
            });
            const status = result?.status || 'unknown';

            addLog('info', `Команда геопозиции: ${status}`);

            if (status === 'shared') {
                setStatusMessage(`Команда ${GEO_SHARE_TEXT} отправлена в чат`);
                return;
            }

            if (status === 'cancelled') {
                setStatusMessage('Отправка команды отменена');
                return;
            }

            setStatusMessage(`Статус отправки команды: ${status}`);
        } catch (error) {
            const message = getUserErrorMessage(
                error,
                'Не удалось отправить команду геопозиции'
            );

            setStatusMessage(message);
            addLog(
                'error',
                `Ошибка команды геопозиции: ${getLogErrorMessage(error)}`
            );
        } finally {
            setGeoSharePending(false);
        }
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
                    Геопозиция
                </h2>
                <GeoPositionStatus
                    error={state.geoError}
                    geo={state.geo}
                    actualityMinutes={GEO_POSITION_ACTUALITY_MINUTES}
                    onShareRequest={handleShareGeoRequest}
                    sharing={geoSharePending}
                />
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
