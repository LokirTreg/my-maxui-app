import { Button } from '@maxhub/max-ui';

import { EmptyState } from './EmptyState';

const WAREHOUSE_LATITUDE = 54.954315;
const WAREHOUSE_LONGITUDE = 35.882343;
const EARTH_RADIUS_KM = 6371;

const deg2rad = (deg) => deg * (Math.PI / 180);

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
};

const getGeoNumber = (value) => {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : null;
};

const getDistanceKm = (geo) => {
    const userLatitude = getGeoNumber(geo?.latitude);
    const userLongitude = getGeoNumber(geo?.longitude);

    if (userLatitude === null || userLongitude === null) {
        return null;
    }

    return getDistanceFromLatLonInKm(
        WAREHOUSE_LATITUDE,
        WAREHOUSE_LONGITUDE,
        userLatitude,
        userLongitude
    );
};

const getDistanceLabel = (distanceKm) => {
    if (distanceKm === null) {
        return '';
    }

    const roundedDistance =
        distanceKm < 10
            ? Math.round(distanceKm * 10) / 10
            : Math.round(distanceKm);

    return roundedDistance.toLocaleString('ru-RU', {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
    });
};

export function GeoPositionStatus({
    actualityMinutes,
    arrivalPending,
    error,
    geo,
    onMarkArrival,
    onOpenRequest,
    opening,
}) {
    const distanceKm = getDistanceKm(geo);
    const distanceLabel = getDistanceLabel(distanceKm);
    const isNearWarehouse = distanceKm !== null && distanceKm < 1;

    if (distanceLabel) {
        return (
            <div className="geo-position">
                <div className="geo-distance">
                    <span className="geo-distance-hint">
                        До склада примерно
                    </span>
                    <span className="geo-distance-value">
                        {distanceLabel} км
                    </span>
                </div>
                {isNearWarehouse ? (
                    <Button
                        className="geo-arrival-button"
                        disabled={arrivalPending}
                        onClick={onMarkArrival}
                    >
                        {arrivalPending ? 'Отмечаем...' : 'Отметил прибытие'}
                    </Button>
                ) : (
                    <Button
                        className="geo-request-button"
                        disabled={opening}
                        onClick={onOpenRequest}
                    >
                        {opening ? 'Открываем чат...' : 'Запросить геопозицию'}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="geo-position">
            <EmptyState
                text={
                    error ||
                    `Геопозиция не сохранена или старше ${actualityMinutes} мин.`
                }
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
