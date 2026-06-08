import { Button } from '@maxhub/max-ui';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { VisitInfo } from '../components/VisitInfo';
import { useDevLog } from '../logs/useDevLog';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const DEFAULT_TVS_ID = '123';

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
    const tvsId = searchParams.get('tvsid') || DEFAULT_TVS_ID;

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

            {!phoneLoading && !phoneError && (
                <VisitInfo
                    title="Актуальный визит"
                    tvsId={tvsId}
                />
            )}
        </Layout>
    );
}
