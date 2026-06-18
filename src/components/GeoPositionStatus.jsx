import { Button } from '@maxhub/max-ui';

import { EmptyState } from './EmptyState';

export function GeoPositionStatus({
    actualityMinutes,
    error,
    geo,
    onOpenRequest,
    opening,
}) {
    if (error) {
        return <EmptyState text="Геопозицию не удалось загрузить" />;
    }

    if (!geo) {
        return (
            <div className="geo-position">
                <EmptyState
                    text={`Геопозиция не сохранена или старше ${actualityMinutes} мин.`}
                />
                <Button
                    className="geo-request-button"
                    disabled={opening}
                    onClick={onOpenRequest}
                >
                    {opening ? 'Открываем чат...' : 'Запросить геопозицию'}
                </Button>
            </div>
        );
    }

    return (
        <div className="geo-position-details">
            <div className="geo-position-row">
                <span className="geo-position-label">Сохранена</span>
                <span className="geo-position-value">
                    {geo.savedAt || 'Не указано'}
                </span>
            </div>
            <div className="geo-position-row">
                <span className="geo-position-label">Актуальность</span>
                <span className="geo-position-value">
                    {actualityMinutes} мин.
                </span>
            </div>
            <div className="geo-position-row">
                <span className="geo-position-label">Широта</span>
                <span className="geo-position-value">{geo.latitude}</span>
            </div>
            <div className="geo-position-row">
                <span className="geo-position-label">Долгота</span>
                <span className="geo-position-value">{geo.longitude}</span>
            </div>
        </div>
    );
}
