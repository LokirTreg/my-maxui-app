export const getGeoDistanceKm = (geo) => {
    const distanceKm = Number(geo?.distanceKm);

    return Number.isFinite(distanceKm) ? distanceKm : null;
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
