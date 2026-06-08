import { ApiValidationError } from './BaseApiRequest';

export function assertObject(value, path) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ApiValidationError(`${path} должен быть объектом`, {
            path,
            value,
        });
    }
}

export function assertArray(value, path) {
    if (!Array.isArray(value)) {
        throw new ApiValidationError(`${path} должен быть массивом`, {
            path,
            value,
        });
    }
}

export function assertBoolean(value, path) {
    if (typeof value !== 'boolean') {
        throw new ApiValidationError(`${path} должен быть boolean`, {
            path,
            value,
        });
    }
}

export function assertString(value, path, { allowEmpty = true } = {}) {
    if (typeof value !== 'string' || (!allowEmpty && value.length === 0)) {
        throw new ApiValidationError(`${path} должен быть строкой`, {
            path,
            value,
        });
    }
}

export function assertOptionalString(value, path) {
    if (value !== undefined && typeof value !== 'string') {
        throw new ApiValidationError(`${path} должен быть строкой`, {
            path,
            value,
        });
    }
}
