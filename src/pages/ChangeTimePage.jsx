import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ErrorMessage } from '../components/ErrorMessage';
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
    const tvsId = searchParams.get('tvsid') || '123';

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
                        Визит #{tvsId}
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

                {!phoneLoading && !phoneError && (
                    <p className="placeholder-text">
                        Экран переноса времени будет подключен к Process.aspx
                        после появления backend API. Телефон пользователя:
                        {' '}
                        {phone}.
                    </p>
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
                        navigate(`/?tvsid=${tvsId}`);
                    }}
                >
                    Домой
                </Button>
            </Flex>
        </Layout>
    );
}
