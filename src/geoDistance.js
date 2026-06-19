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

export const getGeoDistanceKm = (geo) => {
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

export const formatDistanceKm = (distanceKm) => {
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
