import {
    ExecuteCallbackRequest,
    GetPhoneByMaxUserIdRequest,
    GetVisitActionButtonsRequest,
    GetVisitFieldsRequest,
    GetVisitHistoryRequest,
    GetWarehouseContactsRequest,
    SavePhoneByMaxUserIdRequest,
} from './processRequests';

export function getVisitActionButtons(tvsId) {
    return new GetVisitActionButtonsRequest({ tvsId }).execute();
}

export function getPhoneByMaxUserId(maxUserId) {
    return new GetPhoneByMaxUserIdRequest({ maxUserId }).execute();
}

export function savePhoneByMaxUserId(maxUserId, phone) {
    return new SavePhoneByMaxUserIdRequest({ maxUserId, phone }).execute();
}

export function getVisitFields(tvsId) {
    return new GetVisitFieldsRequest({ tvsId }).execute();
}

export function getWarehouseContacts(tvsId) {
    return new GetWarehouseContactsRequest({ tvsId }).execute();
}

export function getVisitHistory(phone) {
    return new GetVisitHistoryRequest({ phone }).execute();
}

export function executeCallback(callback) {
    return new ExecuteCallbackRequest({ callback }).execute();
}
