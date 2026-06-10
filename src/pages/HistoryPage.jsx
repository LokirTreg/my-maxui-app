import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getVisitHistory } from '../api/processApi';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { useDevLog } from '../logs/useDevLog';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const createInitialState = () => ({
    error: '',
    loading: true,
    visits: [],
});

const requestOptions = {
    mode: 'http',
};

export function HistoryPage() {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const {
        error: phoneError,
        loading: phoneLoading,
        maxUserId,
        phone,
        retry: retryPhone,
    } = useMaxUserPhone();
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState(createInitialState);

    useEffect(() => {
        let isActive = true;

        async function loadHistory() {
            await Promise.resolve();

            if (!isActive || !phone) {
                return;
            }

            addLog('info', `Загрузка истории визитов для ${phone}`);

            setState((current) => ({
                ...current,
                error: '',
                loading: true,
            }));

            try {
                const result = await getVisitHistory(phone, requestOptions);

                if (!isActive) {
                    return;
                }

                setState({
                    error: '',
                    loading: false,
                    visits: result.buttons || [],
                });

                addLog(
                    'info',
                    `История для ${phone}: визитов ${result.buttons?.length || 0}`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить историю визитов';

                setState({
                    error: message,
                    loading: false,
                    visits: [],
                });

                addLog('error', `Ошибка истории ${phone}: ${message}`);
            }
        }

        loadHistory();

        return () => {
            isActive = false;
        };
    }, [addLog, phone, reloadKey]);

    const homeUrl = '/';

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        История визитов
                    </h1>
                    <p className="page-description">
                        MAX user: {maxUserId || '...'}
                        {phone && `, телефон: ${phone}`}
                    </p>
                </div>
                <Button
                    className="secondary-button"
                    onClick={() => navigate(homeUrl)}
                >
                    Домой
                </Button>
            </div>

            <Panel className="section">
                {phoneLoading && (
                    <Loading text="Получаем телефон пользователя..." />
                )}

                {!phoneLoading && phoneError && (
                    <ErrorMessage message={phoneError} onRetry={retryPhone} />
                )}

                {!phoneLoading && !phoneError && state.loading && (
                    <Loading text="Загружаем историю..." />
                )}

                {!phoneLoading && !phoneError && !state.loading && state.error && (
                    <ErrorMessage
                        message={state.error}
                        onRetry={() => setReloadKey((key) => key + 1)}
                    />
                )}

                {!phoneLoading &&
                    !phoneError &&
                    !state.loading &&
                    !state.error &&
                    !state.visits.length && (
                        <EmptyState text="История визитов пуста" />
                    )}

                {!phoneLoading &&
                    !phoneError &&
                    !state.loading &&
                    !state.error &&
                    state.visits.length > 0 && (
                        <Flex className="history-list" direction="column" gap={8}>
                            {state.visits.map((visit) => (
                                <Button
                                    className={`history-item ${
                                        visit.cssclass || ''
                                    }`}
                                    key={visit.ID}
                                    onClick={() => {
                                        addLog(
                                            'action',
                                            `Открываем визит ${visit.ID} из истории`
                                        );
                                        navigate(`/visit/${visit.ID}`);
                                    }}
                                >
                                    {visit.text}
                                </Button>
                            ))}
                        </Flex>
                    )}
            </Panel>
        </Layout>
    );
}
