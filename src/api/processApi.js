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
    options = {}
) {
    return new ReserveUnplannedVisitSlotRequest(
        { maxUserId, phone, selections, slotId },
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

export function getUnplannedVisitForm(phone, maxUserId, options = {}) {
    return new GetUnplannedVisitFormRequest(
        { maxUserId, phone },
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

export function getUnplannedVisitSlots(
    phone,
    maxUserId,
    selections,
    options = {}
) {
    return new GetUnplannedVisitSlotsRequest(
        { maxUserId, phone, selections },
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
