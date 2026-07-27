import {
    ChangeVisitSlotRequest,
    CheckSelfRegistrationRequest,
    CreateUnplannedVisitRequest,
    ExecuteCallbackRequest,
    GetActualVisitRequest,
    GetAvailableVisitDatesRequest,
    GetAvailableVisitSlotsRequest,
    GetGeoPositionRequest,
    GetPhoneByMaxUserIdRequest,
    GetUnplannedVisitCreationFormRequest,
    GetUnplannedVisitDatesRequest,
    GetUnplannedVisitFormRequest,
    GetUnplannedVisitSlotsRequest,
    GetVisitActionButtonsRequest,
    GetVisitFieldsRequest,
    GetVisitHistoryRequest,
    GetWarehouseContactsRequest,
    ReserveUnplannedVisitSlotRequest,
    SavePhoneByMaxUserIdRequest,
} from './processRequests';

export function changeVisitSlot(tvsId, slotId, options = {}) {
    return new ChangeVisitSlotRequest({ slotId, tvsId }, options).execute();
}

export function checkSelfRegistration(phone, options = {}) {
    return new CheckSelfRegistrationRequest({ phone }, options).execute();
}

export function createUnplannedVisit(
    phone,
    maxUserId,
    reservationId,
    fields,
    purposes,
    options = {}
) {
    return new CreateUnplannedVisitRequest(
        { fields, maxUserId, phone, purposes, reservationId },
        options
    ).execute();
}

export function reserveUnplannedVisitSlot(
    phone,
    maxUserId,
    selections,
    slotId,
    date,
    userId,
    options = {}
) {
    return new ReserveUnplannedVisitSlotRequest(
        { date, maxUserId, phone, selections, slotId, userId },
        options
    ).execute();
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

export function getGeoPosition(
    tvsId,
    phone,
    maxUserId,
    actualityMinutes,
    options = {}
) {
    return new GetGeoPositionRequest(
        { actualityMinutes, maxUserId, phone, tvsId },
        options
    ).execute();
}

export function getUnplannedVisitForm(phone, maxUserId, userId, options = {}) {
    return new GetUnplannedVisitFormRequest(
        { maxUserId, phone, userId },
        options
    ).execute();
}

export function getUnplannedVisitCreationForm(
    phone,
    maxUserId,
    reservationId,
    options = {}
) {
    return new GetUnplannedVisitCreationFormRequest(
        { maxUserId, phone, reservationId },
        options
    ).execute();
}

export function getUnplannedVisitDates(
    phone,
    maxUserId,
    selections,
    userId,
    options = {}
) {
    return new GetUnplannedVisitDatesRequest(
        { maxUserId, phone, selections, userId },
        options
    ).execute();
}

export function getUnplannedVisitSlots(
    phone,
    maxUserId,
    selections,
    date,
    userId,
    options = {}
) {
    return new GetUnplannedVisitSlotsRequest(
        { date, maxUserId, phone, selections, userId },
        options
    ).execute();
}

export function getVisitActionButtons(tvsId, options = {}) {
    return new GetVisitActionButtonsRequest({ tvsId }, options).execute();
}

export function getPhoneByMaxUserId(maxUserId, options = {}) {
    return new GetPhoneByMaxUserIdRequest({ maxUserId }, options).execute();
}

export function savePhoneByMaxUserId(
    maxUserId,
    phone,
    chatid,
    userId,
    options = {}
) {
    return new SavePhoneByMaxUserIdRequest(
        { chatid, maxUserId, phone, userId },
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
