import { Button, Flex } from '@maxhub/max-ui';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { VisitInfo } from '../components/VisitInfo';
import { useDevLog } from '../logs/useDevLog';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

export function VisitPage() {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const { id } = useParams();
    const {
        error: phoneError,
        loading: phoneLoading,
        retry,
    } = useMaxUserPhone();
    const tvsId = id || '';

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Выбранный визит
                    </h1>
                    <p className="page-description">
                        {tvsId ? `Визит #${tvsId}` : 'ID визита не передан'}
                    </p>
                </div>
                <Flex className="nav-actions" gap={8}>
                    <Button
                        className="secondary-button"
                        onClick={() => {
                            addLog(
                                'action',
                                `Назад к истории из визита ${tvsId}`
                            );
                            navigate('/history');
                        }}
                    >
                        Назад к истории
                    </Button>
                    <Button
                        className="secondary-button"
                        onClick={() => {
                            addLog('action', `Домой из визита ${tvsId}`);
                            navigate(
                                tvsId
                                    ? `/?tvsid=${encodeURIComponent(tvsId)}`
                                    : '/'
                            );
                        }}
                    >
                        Домой
                    </Button>
                </Flex>
            </div>

            {phoneLoading && <Loading text="Получаем телефон пользователя..." />}

            {!phoneLoading && phoneError && (
                <ErrorMessage message={phoneError} onRetry={retry} />
            )}

            {!phoneLoading && !phoneError && tvsId && (
                <VisitInfo
                    title={`Информация о визите #${tvsId}`}
                    tvsId={tvsId}
                />
            )}

            {!phoneLoading && !phoneError && !tvsId && (
                <EmptyState text="ID визита не передан" />
            )}
        </Layout>
    );
}
