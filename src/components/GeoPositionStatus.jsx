import { EmptyState } from './EmptyState';
import { formatDistanceKm, getGeoDistanceKm } from '../geoDistance';

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
                text={
                    error ||
                    `Нет актуальной геопозиции за последние ${actualityMinutes} мин.`
                }
            />
        </div>
    );
}
