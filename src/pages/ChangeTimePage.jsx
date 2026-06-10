import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { useDevLog } from '../logs/useDevLog';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

export function ChangeTimePage() {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const {
        error: phoneError,
        loading: phoneLoading,
        phone,
        retry,
    } = useMaxUserPhone();
    const [searchParams] = useSearchParams();
    const tvsId = searchParams.get('tvsid') || '';

    useEffect(() => {
        let isActive = true;

        async function logOpen() {
            await Promise.resolve();

            if (isActive) {
                addLog('info', `Открыт экран переноса времени для ${tvsId}`);
            }
        }

        logOpen();

        return () => {
            isActive = false;
        };
    }, [addLog, tvsId]);

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Перенос времени
                    </h1>
                    <p className="page-description">
                        {tvsId ? `Визит #${tvsId}` : 'ID визита не передан'}
                    </p>
                </div>
            </div>

            <Panel className="section">
                {phoneLoading && (
                    <Loading text="Получаем телефон пользователя..." />
                )}

                {!phoneLoading && phoneError && (
                    <ErrorMessage message={phoneError} onRetry={retry} />
                )}

                {!phoneLoading && !phoneError && tvsId && (
                    <p className="placeholder-text">
                        Экран переноса времени будет подключен к Process.aspx
                        после появления backend API. Телефон пользователя:
                        {' '}
                        {phone}.
                    </p>
                )}

                {!phoneLoading && !phoneError && !tvsId && (
                    <EmptyState text="ID визита не передан" />
                )}
            </Panel>

            <Flex className="nav-actions" gap={8}>
                <Button
                    className="secondary-button"
                    onClick={() => {
                        addLog('action', 'Назад с экрана переноса времени');
                        navigate(-1);
                    }}
                >
                    Назад
                </Button>
                <Button
                    className="secondary-button"
                    onClick={() => {
                        addLog('action', 'Домой с экрана переноса времени');
                        navigate(tvsId ? `/?tvsid=${tvsId}` : '/');
                    }}
                >
                    Домой
                </Button>
            </Flex>
        </Layout>
    );
}
