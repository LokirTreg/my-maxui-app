import { EmptyState } from './EmptyState';
import { formatDistanceKm, getGeoDistanceKm } from '../geoDistance';

const getEmptyText = (error, actualityMinutes) => {
    if (error) {
        return error;
    }

    if (Number(actualityMinutes) > 0) {
        return `Нет актуальной геопозиции за последние ${actualityMinutes} мин.`;
    }

    return 'Нет актуальной геопозиции';
};

export function GeoPositionStatus({
    actualityMinutes,
    error,
    geo,
}) {
    const distanceKm = getGeoDistanceKm(geo);
    const distanceLabel = formatDistanceKm(distanceKm);

    if (distanceLabel) {
        return (
            <div className="geo-distance">
                <span className="geo-distance-hint">
                    До склада примерно
                </span>
                <span className="geo-distance-value">
                    {distanceLabel} км
                </span>
            </div>
        );
    }

    return (
        <div className="geo-position">
            <EmptyState
                text={getEmptyText(error, actualityMinutes)}
            />
        </div>
    );
}
