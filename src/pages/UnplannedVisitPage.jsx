import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getUnplannedVisitDates,
    getUnplannedVisitForm,
    getUnplannedVisitSlots,
    reserveUnplannedVisitSlot,
} from '../api/processApi';
import { getRequestOptions, isMockApiMode } from '../api/requestOptions';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { useDevLog } from '../logs/useDevLog';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const requestOptions = getRequestOptions();

const createFieldsState = () => ({
    error: '',
    fields: [],
    loading: false,
});

const createSlotsState = () => ({
    error: '',
    loading: false,
    slots: [],
});

const createDatesState = () => ({
    dates: [],
    error: '',
    loading: false,
});

const createSubmitState = () => ({
    error: '',
    loading: false,
});

const buildVisitPageUrl = (tvsId) => {
    const params = new URLSearchParams();

    if (isMockApiMode()) {
        params.set('mock', '1');
    }

    const query = params.toString();
    const path = `/visit/${encodeURIComponent(tvsId)}`;

    return query ? `${path}?${query}` : path;
};

export function UnplannedVisitPage() {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const {
        error: phoneError,
        loading: phoneLoading,
        maxUserId,
        phone,
        retry,
        userId,
    } = useMaxUserPhone();
    const [fieldsReloadKey, setFieldsReloadKey] = useState(0);
    const [datesReloadKey, setDatesReloadKey] = useState(0);
    const [slotsReloadKey, setSlotsReloadKey] = useState(0);
    const [fieldsState, setFieldsState] = useState(createFieldsState);
    const [datesState, setDatesState] = useState(createDatesState);
    const [slotsState, setSlotsState] = useState(createSlotsState);
    const [submitState, setSubmitState] = useState(createSubmitState);
    const [selectedValues, setSelectedValues] = useState({});
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const allFieldsSelected =
        fieldsState.fields.length > 0 &&
        fieldsState.fields.every((field) => selectedValues[field.id]);
    const selectedSlot = slotsState.slots.find(
        (slot) => slot.slotId === selectedSlotId
    );

    useEffect(() => {
        let isActive = true;

        async function logOpen() {
            await Promise.resolve();

            if (isActive) {
                addLog('info', 'Открыт экран незапланированного визита');
            }
        }

        logOpen();

        return () => {
            isActive = false;
        };
    }, [addLog]);

    useEffect(() => {
        if (phoneLoading || phoneError || !phone) {
            return;
        }

        let isActive = true;

        async function loadFields() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            setFieldsState({
                error: '',
                fields: [],
                loading: true,
            });
            setDatesState(createDatesState());
            setSlotsState(createSlotsState());
            setSubmitState(createSubmitState());
            setSelectedValues({});
            setSelectedDate('');
            setSelectedSlotId('');
            addLog('info', `Загрузка формы незапланированного визита для ${phone}`);

            try {
                const result = await getUnplannedVisitForm(
                    phone,
                    maxUserId,
                    userId,
                    requestOptions
                );

                if (!isActive) {
                    return;
                }

                setFieldsState({
                    error: '',
                    fields: result.fields || [],
                    loading: false,
                });
                addLog(
                    'info',
                    `Полей формы незапланированного визита: ${
                        result.fields?.length || 0
                    }`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить форму';

                setFieldsState({
                    error: message,
                    fields: [],
                    loading: false,
                });
                addLog('error', `Ошибка формы незапланированного визита: ${message}`);
            }
        }

        loadFields();

        return () => {
            isActive = false;
        };
    }, [
        addLog,
        fieldsReloadKey,
        maxUserId,
        phone,
        phoneError,
        phoneLoading,
        userId,
    ]);

    useEffect(() => {
        if (phoneLoading || phoneError || !phone || !allFieldsSelected) {
            return;
        }

        let isActive = true;
        const selections = { ...selectedValues };

        async function loadDates() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            setDatesState({
                dates: [],
                error: '',
                loading: true,
            });
            setSlotsState(createSlotsState());
            setSelectedDate('');
            setSelectedSlotId('');
            setSubmitState(createSubmitState());
            addLog(
                'info',
                `Загрузка дат незапланированного визита: ${JSON.stringify(
                    selections
                )}`
            );

            try {
                const result = await getUnplannedVisitDates(
                    phone,
                    maxUserId,
                    selections,
                    userId,
                    requestOptions
                );

                if (!isActive) {
                    return;
                }

                setDatesState({
                    dates: result.dates || [],
                    error: '',
                    loading: false,
                });
                addLog(
                    'info',
                    `Доступных дат для незапланированного визита: ${
                        result.dates?.length || 0
                    }`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить даты';

                setDatesState({
                    dates: [],
                    error: message,
                    loading: false,
                });
                addLog(
                    'error',
                    `Ошибка дат незапланированного визита: ${message}`
                );
            }
        }

        loadDates();

        return () => {
            isActive = false;
        };
    }, [
        addLog,
        allFieldsSelected,
        datesReloadKey,
        maxUserId,
        phone,
        phoneError,
        phoneLoading,
        selectedValues,
        userId,
    ]);

    useEffect(() => {
        if (
            phoneLoading ||
            phoneError ||
            !phone ||
            !allFieldsSelected ||
            !selectedDate
        ) {
            return;
        }

        let isActive = true;
        const selections = { ...selectedValues };

        async function loadSlots() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            setSlotsState({
                error: '',
                loading: true,
                slots: [],
            });
            setSelectedSlotId('');
            setSubmitState(createSubmitState());
            addLog(
                'info',
                `Загрузка времени незапланированного визита: ${JSON.stringify(
                    selections
                )}`
            );

            try {
                const result = await getUnplannedVisitSlots(
                    phone,
                    maxUserId,
                    selections,
                    selectedDate,
                    userId,
                    requestOptions
                );

                if (!isActive) {
                    return;
                }

                setSlotsState({
                    error: '',
                    loading: false,
                    slots: result.slots || [],
                });
                addLog(
                    'info',
                    `Доступных слотов для незапланированного визита: ${
                        result.slots?.length || 0
                    }`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить время';

                setSlotsState({
                    error: message,
                    loading: false,
                    slots: [],
                });
                addLog(
                    'error',
                    `Ошибка времени незапланированного визита: ${message}`
                );
            }
        }

        loadSlots();

        return () => {
            isActive = false;
        };
    }, [
        addLog,
        allFieldsSelected,
        maxUserId,
        phone,
        phoneError,
        phoneLoading,
        selectedValues,
        selectedDate,
        slotsReloadKey,
        userId,
    ]);

    const handleFieldChange = (fieldId, value) => {
        setSelectedValues((current) => ({
            ...current,
            [fieldId]: value,
        }));
        setDatesState(createDatesState());
        setSlotsState(createSlotsState());
        setSubmitState(createSubmitState());
        setSelectedDate('');
        setSelectedSlotId('');
        addLog('action', `Выбор поля ${fieldId}: ${value || '<empty>'}`);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSlotsState(createSlotsState());
        setSubmitState(createSubmitState());
        setSelectedSlotId('');
        addLog('action', `Выбрана дата незапланированного визита: ${date}`);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlotId(slot.slotId);
        setSubmitState(createSubmitState());
        addLog('action', `Выбран слот незапланированного визита: ${slot.slotId}`);
    };

    const handleReserveSlot = async () => {
        if (!selectedSlot) {
            return;
        }

        setSubmitState({
            error: '',
            loading: true,
        });
        addLog(
            'action',
            `Резервирование времени незапланированного визита, slot_id ${selectedSlot.slotId}`
        );

        try {
            const result = await reserveUnplannedVisitSlot(
                phone,
                maxUserId,
                selectedValues,
                selectedSlot.slotId,
                selectedDate,
                userId,
                requestOptions
            );

            if (!result.ok) {
                throw new Error(result.message || 'Не удалось зарезервировать время');
            }

            addLog(
                'info',
                `Время визита зарезервировано, визит ${result.tvsId}: ${result.message}`
            );
            navigate(buildVisitPageUrl(result.tvsId));
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось зарезервировать время';

            setSubmitState({
                error: message,
                loading: false,
            });
            addLog('error', `Ошибка резервирования времени: ${message}`);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Незапланированный визит
                    </h1>
                </div>
            </div>

            <Panel className="section">
                {phoneLoading && (
                    <Loading text="Получаем телефон пользователя..." />
                )}

                {!phoneLoading && phoneError && (
                    <ErrorMessage message={phoneError} onRetry={retry} />
                )}

                {!phoneLoading && !phoneError && fieldsState.loading && (
                    <Loading text="Загружаем форму..." />
                )}

                {!phoneLoading &&
                    !phoneError &&
                    !fieldsState.loading &&
                    fieldsState.error && (
                        <ErrorMessage
                            message="Не удалось загрузить форму. Подробности в логах."
                            onRetry={() =>
                                setFieldsReloadKey((key) => key + 1)
                            }
                        />
                    )}

                {!phoneLoading &&
                    !phoneError &&
                    !fieldsState.loading &&
                    !fieldsState.error &&
                    !fieldsState.fields.length && (
                        <EmptyState text="Нет доступных параметров визита" />
                    )}

                {!phoneLoading &&
                    !phoneError &&
                    !fieldsState.loading &&
                    !fieldsState.error &&
                    fieldsState.fields.length > 0 && (
                        <div className="time-picker">
                            <div className="time-picker-block">
                                <h2 className="section-title">Параметры</h2>

                                <div className="select-list">
                                    {fieldsState.fields.map((field) => (
                                        <label
                                            className="select-field"
                                            key={field.id}
                                        >
                                            <span className="select-label">
                                                {field.name}
                                            </span>
                                            <select
                                                className="select-control"
                                                value={
                                                    selectedValues[field.id] || ''
                                                }
                                                onChange={(event) =>
                                                    handleFieldChange(
                                                        field.id,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Выберите значение
                                                </option>
                                                {field.options.map((option) => (
                                                    <option
                                                        key={option.id}
                                                        value={option.id}
                                                    >
                                                        {option.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="time-picker-block">
                                <h2 className="section-title">Доступные даты</h2>

                                {!allFieldsSelected && (
                                    <p className="placeholder-text">
                                        Выберите все параметры, чтобы увидеть даты.
                                    </p>
                                )}

                                {allFieldsSelected && datesState.loading && (
                                    <Loading text="Загружаем даты..." />
                                )}

                                {allFieldsSelected &&
                                    !datesState.loading &&
                                    datesState.error && (
                                        <ErrorMessage
                                            message="Не удалось загрузить даты. Подробности в логах."
                                            onRetry={() =>
                                                setDatesReloadKey(
                                                    (key) => key + 1
                                                )
                                            }
                                        />
                                    )}

                                {allFieldsSelected &&
                                    !datesState.loading &&
                                    !datesState.error &&
                                    !datesState.dates.length && (
                                        <EmptyState text="Нет доступных дат" />
                                    )}

                                {allFieldsSelected &&
                                    !datesState.loading &&
                                    !datesState.error &&
                                    datesState.dates.length > 0 && (
                                        <div className="slot-list">
                                            {datesState.dates.map((dateItem) => (
                                                <Button
                                                    className={`slot-button ${
                                                        selectedDate ===
                                                        dateItem.date
                                                            ? 'selected'
                                                            : ''
                                                    }`}
                                                    key={dateItem.date}
                                                    onClick={() =>
                                                        handleDateSelect(
                                                            dateItem.date
                                                        )
                                                    }
                                                >
                                                    {dateItem.label}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                            </div>

                            <div className="time-picker-block">
                                <h2 className="section-title">Доступное время</h2>

                                {!selectedDate && (
                                    <p className="placeholder-text">
                                        Выберите дату, чтобы увидеть время.
                                    </p>
                                )}

                                {selectedDate && slotsState.loading && (
                                    <Loading text="Загружаем время..." />
                                )}

                                {selectedDate &&
                                    !slotsState.loading &&
                                    slotsState.error && (
                                        <ErrorMessage
                                            message="Не удалось загрузить время. Подробности в логах."
                                            onRetry={() =>
                                                setSlotsReloadKey(
                                                    (key) => key + 1
                                                )
                                            }
                                        />
                                    )}

                                {selectedDate &&
                                    !slotsState.loading &&
                                    !slotsState.error &&
                                    !slotsState.slots.length && (
                                        <EmptyState text="Нет доступного времени" />
                                    )}

                                {selectedDate &&
                                    !slotsState.loading &&
                                    !slotsState.error &&
                                    slotsState.slots.length > 0 && (
                                        <div className="slot-list">
                                            {slotsState.slots.map((slot) => (
                                                <Button
                                                    className={`slot-button ${
                                                        selectedSlotId ===
                                                        slot.slotId
                                                            ? 'selected'
                                                            : ''
                                                    }`}
                                                    key={slot.slotId}
                                                    onClick={() =>
                                                        handleSlotSelect(slot)
                                                    }
                                                >
                                                    {slot.name}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                            </div>

                            {selectedDate && selectedSlot && (
                                <div className="confirm-slot">
                                    <Button
                                        className="confirm-button"
                                        disabled={submitState.loading}
                                        onClick={handleReserveSlot}
                                    >
                                        {submitState.loading
                                            ? 'Резервируем...'
                                            : 'Подтвердить время'}
                                    </Button>

                                    {submitState.error && (
                                        <ErrorMessage
                                            message="Не удалось зарезервировать время. Подробности в логах."
                                            onRetry={handleReserveSlot}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
            </Panel>

            <Flex className="nav-actions" gap={8}>
                <Button
                    className="secondary-button"
                    onClick={() => {
                        addLog('action', 'Назад с экрана незапланированного визита');
                        navigate(-1);
                    }}
                >
                    Назад
                </Button>
                <Button
                    className="secondary-button"
                    onClick={() => {
                        addLog('action', 'Домой с экрана незапланированного визита');
                        navigate('/');
                    }}
                >
                    Домой
                </Button>
            </Flex>
        </Layout>
    );
}
