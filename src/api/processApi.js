import {
    ExecuteCallbackRequest,
    GetPhoneByMaxUserIdRequest,
    GetVisitActionButtonsRequest,
    GetVisitFieldsRequest,
    GetVisitHistoryRequest,
    GetWarehouseContactsRequest,
    SavePhoneByMaxUserIdRequest,
} from './processRequests';

export function getVisitActionButtons(tvsId, options = {}) {
    return new GetVisitActionButtonsRequest({ tvsId }, options).execute();
}

export function getPhoneByMaxUserId(maxUserId, options = {}) {
    return new GetPhoneByMaxUserIdRequest({ maxUserId }, options).execute();
}

export function savePhoneByMaxUserId(maxUserId, phone, options = {}) {
    return new SavePhoneByMaxUserIdRequest(
        { maxUserId, phone },
        options
    ).execute();
}

export function getVisitFields(tvsId, options = {}) {
    return new GetVisitFieldsRequest({ tvsId }, options).execute();
}

export function getWarehouseContacts(tvsId, options = {}) {
    return new GetWarehouseContactsRequest({ tvsId }, options).execute();
}

export function getVisitHistory(phone, options = {}) {
    return new GetVisitHistoryRequest({ phone }, options).execute();
}

export function executeCallback(callback, options = {}) {
    return new ExecuteCallbackRequest({ callback }, options).execute();
}
