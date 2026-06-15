import { Button } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getActualVisit } from '../api/processApi';
import { getRequestOptions } from '../api/requestOptions';
import { Layout } from '../components/Layout';
import { VisitInfo } from '../components/VisitInfo';
import { useDevLog } from '../logs/useDevLog';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const requestOptions = getRequestOptions();

const createActualVisitState = () => ({
    error: '',
    loading: false,
    tvsId: '',
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
    const actualTvsId = tvsId || actualVisitState.tvsId;
    const shouldUseActualVisitRequest = !tvsId;
    const actualVisitLoading =
        shouldUseActualVisitRequest && actualVisitState.loading;
    const actualVisitError =
        shouldUseActualVisitRequest && actualVisitState.error;

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
