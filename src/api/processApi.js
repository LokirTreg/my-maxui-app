import {
    ChangeVisitSlotRequest,
    ExecuteCallbackRequest,
    GetActualVisitRequest,
    GetAvailableVisitDatesRequest,
    GetAvailableVisitSlotsRequest,
    GetPhoneByMaxUserIdRequest,
    GetVisitActionButtonsRequest,
    GetVisitFieldsRequest,
    GetVisitHistoryRequest,
    GetWarehouseContactsRequest,
    SavePhoneByMaxUserIdRequest,
} from './processRequests';

export function changeVisitSlot(tvsId, slotId, options = {}) {
    return new ChangeVisitSlotRequest({ slotId, tvsId }, options).execute();
}

export function getActualVisit(phone, maxUserId, options = {}) {
    return new GetActualVisitRequest({ phone, maxUserId }, options).execute();
}

export function getAvailableVisitDates(tvsId, options = {}) {
    return new GetAvailableVisitDatesRequest(
        { tvsId },
        options
    ).execute();
}

export function getAvailableVisitSlots(tvsId, date, options = {}) {
    return new GetAvailableVisitSlotsRequest(
        { date, tvsId },
        options
    ).execute();
}

export function getVisitActionButtons(tvsId, options = {}) {
    return new GetVisitActionButtonsRequest({ tvsId }, options).execute();
}

export function getPhoneByMaxUserId(maxUserId, options = {}) {
    return new GetPhoneByMaxUserIdRequest({ maxUserId }, options).execute();
}

export function savePhoneByMaxUserId(maxUserId, phone, chatid, options = {}) {
    return new SavePhoneByMaxUserIdRequest(
        { maxUserId, phone, chatid },
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
