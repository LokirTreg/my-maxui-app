import { Button } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { checkSelfRegistration, getActualVisit } from '../api/processApi';
import { getRequestOptions, isMockApiMode } from '../api/requestOptions';
import { Layout } from '../components/Layout';
import { VisitInfo } from '../components/VisitInfo';
import { useDevLog } from '../logs/useDevLog';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const requestOptions = getRequestOptions();

const buildUnplannedVisitUrl = () =>
    isMockApiMode() ? '/unplanned-visit?mock=1' : '/unplanned-visit';

const createActualVisitState = () => ({
    error: '',
    loading: false,
    tvsId: '',
});

const createSelfRegistrationState = () => ({
    error: '',
    loading: false,
    phone: '',
    registered: false,
});

export function HomePage() {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const {
        error: phoneError,
        loading: phoneLoading,
        maxUserId,
        phone,
        retry,
        source,
    } = useMaxUserPhone();
    const [searchParams] = useSearchParams();
    const tvsId = searchParams.get('tvsid') || '';
    const [actualVisitReloadKey, setActualVisitReloadKey] = useState(0);
    const [actualVisitState, setActualVisitState] = useState(
        createActualVisitState
    );
    const [selfRegistrationState, setSelfRegistrationState] = useState(
        createSelfRegistrationState
    );
    const actualTvsId = tvsId || actualVisitState.tvsId;
    const shouldUseActualVisitRequest = !tvsId;
    const actualVisitLoading =
        shouldUseActualVisitRequest && actualVisitState.loading;
    const actualVisitError =
        shouldUseActualVisitRequest && actualVisitState.error;
    const canShowSelfRegistration =
        !phoneLoading &&
        !phoneError &&
        selfRegistrationState.phone === phone &&
        selfRegistrationState.registered;

    useEffect(() => {
        if (phoneLoading || phoneError || tvsId) {
            return;
        }

        let isActive = true;

        async function loadActualVisit() {
            setActualVisitState({
                error: '',
                loading: true,
                tvsId: '',
            });

            try {
                addLog(
                    'info',
                    `Process: запрос актуального визита для ${phone || maxUserId}`
                );

                const result = await getActualVisit(
                    phone,
                    maxUserId,
                    requestOptions
                );

                if (!isActive) {
                    return;
                }

                setActualVisitState({
                    error: '',
                    loading: false,
                    tvsId: result.tvsId,
                });

                addLog(
                    'info',
                    result.tvsId
                        ? `Актуальный визит: ${result.tvsId}`
                        : 'Актуальных незавершённых визитов нет'
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось получить актуальный визит';

                setActualVisitState({
                    error: message,
                    loading: false,
                    tvsId: '',
                });
                addLog('error', `Ошибка актуального визита: ${message}`);
            }
        }

        loadActualVisit();

        return () => {
            isActive = false;
        };
    }, [
        actualVisitReloadKey,
        addLog,
        maxUserId,
        phone,
        phoneError,
        phoneLoading,
        tvsId,
    ]);

    useEffect(() => {
        if (phoneLoading || phoneError || !phone) {
            return;
        }

        let isActive = true;

        async function loadSelfRegistrationStatus() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            setSelfRegistrationState({
                error: '',
                loading: true,
                phone,
                registered: false,
            });

            try {
                addLog(
                    'info',
                    `Process: проверка саморегистрации для телефона ${phone}`
                );

                const result = await checkSelfRegistration(phone, requestOptions);

                if (!isActive) {
                    return;
                }

                setSelfRegistrationState({
                    error: '',
                    loading: false,
                    phone,
                    registered: result.registered,
                });
                addLog(
                    'info',
                    result.registered
                        ? `Саморегистрация доступна для ${phone}`
                        : `Саморегистрация недоступна для ${phone}`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось проверить саморегистрацию';

                setSelfRegistrationState({
                    error: message,
                    loading: false,
                    phone,
                    registered: false,
                });
                addLog('error', `Ошибка проверки саморегистрации: ${message}`);
            }
        }

        loadSelfRegistrationStatus();

        return () => {
            isActive = false;
        };
    }, [addLog, phone, phoneError, phoneLoading]);

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Информация об актуальном визите
                    </h1>
                    <p className="page-description">
                        MAX user: {maxUserId || '...'}
                        {phone && `, телефон: ${phone}`}
                        {source && ` (${source})`}
                    </p>
                </div>
                <div className="header-actions">
                    <Button
                        className="secondary-button"
                        onClick={() => {
                            addLog('action', `Открываем историю для ${phone}`);
                            navigate('/history');
                        }}
                        disabled={phoneLoading || Boolean(phoneError)}
                    >
                        История визитов
                    </Button>
                    {canShowSelfRegistration && (
                        <Button
                            className="secondary-button"
                            onClick={() => {
                                addLog(
                                    'action',
                                    'Открываем регистрацию незапланированного визита'
                                );
                                navigate(buildUnplannedVisitUrl());
                            }}
                            disabled={
                                phoneLoading ||
                                Boolean(phoneError) ||
                                selfRegistrationState.loading
                            }
                        >
                            Саморегистрация
                        </Button>
                    )}
                </div>
            </div>

            {phoneLoading && <Loading text="Получаем телефон пользователя..." />}

            {!phoneLoading && phoneError && (
                <ErrorMessage message={phoneError} onRetry={retry} />
            )}

            {!phoneLoading && !phoneError && actualVisitLoading && (
                <Loading text="Ищем актуальный визит..." />
            )}

            {!phoneLoading &&
                !phoneError &&
                !actualVisitLoading &&
                actualVisitError && (
                    <ErrorMessage
                        message="Не удалось получить актуальный визит. Подробности в логах."
                        onRetry={() => setActualVisitReloadKey((key) => key + 1)}
                    />
                )}

            {!phoneLoading &&
                !phoneError &&
                !actualVisitLoading &&
                !actualVisitError &&
                actualTvsId && (
                    <VisitInfo
                        title="Актуальный визит"
                        tvsId={actualTvsId}
                    />
                )}

            {!phoneLoading &&
                !phoneError &&
                !actualVisitLoading &&
                !actualVisitError &&
                !actualTvsId && (
                    <EmptyState text="Актуальных незавершённых визитов нет" />
                )}
        </Layout>
    );
}
