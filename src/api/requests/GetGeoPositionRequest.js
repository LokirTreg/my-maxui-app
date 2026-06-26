import { ProcessApiRequest } from './ProcessApiRequest';
import { normalizeId } from './normalizeId';
import { assertObject, assertOptionalString, assertString } from '../validation';

const getFirstValue = (source, keys) => {
    for (const key of keys) {
        const value = source?.[key];

        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }

    return '';
};

const isFalseValue = (value) =>
    value === false ||
    value === 0 ||
    String(value).toLowerCase() === 'false' ||
    String(value) === '0';

const normalizeGeoItem = (item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
    }

    if (item.Success === false || item.success === false || item.ok === false) {
        return null;
    }

    const actualValue = getFirstValue(item, [
        'is_actual',
        'isActual',
        'actual',
        'IsActual',
        'Actual',
    ]);

    if (actualValue !== '' && isFalseValue(actualValue)) {
        return null;
    }

    const distanceKm = getFirstValue(item, [
        'distance_km',
        'distanceKm',
        'DistanceKm',
        'distanceKM',
        'distance',
        'Distance',
    ]);

    if (distanceKm === '') {
        return null;
    }

    return {
        distanceKm: String(distanceKm),
        savedAt: String(
            getFirstValue(item, [
                'saved_at',
                'savedAt',
                'created_at',
                'createdAt',
                'timestamp',
                'date',
            ])
        ),
    };
};

export class GetGeoPositionRequest extends ProcessApiRequest {
    get processMethod() {
        return 'get_geo_position';
    }

    get method() {
        return 'GET';
    }

    getMockFailureKey() {
        return this.params.tvsId || this.params.maxUserId || this.params.phone;
    }

    buildProcessParams() {
        return {
            actuality_minutes: String(this.params.actualityMinutes || ''),
            max_user_id: String(this.params.maxUserId || ''),
            phone: String(this.params.phone || ''),
            tvsid: normalizeId(this.params.tvsId),
        };
    }

    buildMockResponse() {
        const id = normalizeId(this.params.tvsId);

        if (id === '124') {
            return {
                geo: {
                    distanceKm: '182.4',
                    savedAt: '18.06.2026 10:24',
                },
            };
        }

        if (id === '125') {
            return {
                geo: {
                    distanceKm: '0.03',
                    savedAt: '18.06.2026 10:26',
                },
            };
        }

        return {
            geo: null,
        };
    }

    transformEnvelopeData(data) {
        const normalizedData = Array.isArray(data) ? data[0] : data;

        return {
            geo: normalizeGeoItem(normalizedData),
        };
    }

    validateResponse(response) {
        assertObject(response, 'getGeoPosition.response');

        if (response.geo === null) {
            return;
        }

        assertObject(response.geo, 'getGeoPosition.response.geo');
        assertOptionalString(
            response.geo.savedAt,
            'getGeoPosition.response.geo.savedAt'
        );
        assertString(
            response.geo.distanceKm,
            'getGeoPosition.response.geo.distanceKm',
            { allowEmpty: false }
        );
    }
}
