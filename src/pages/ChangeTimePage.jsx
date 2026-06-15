import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
    changeVisitSlot,
    getAvailableVisitDates,
    getAvailableVisitSlots,
} from '../api/processApi';
import { getRequestOptions } from '../api/requestOptions';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { useDevLog } from '../logs/useDevLog';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const requestOptions = getRequestOptions();

const createDatesState = () => ({
    dates: [],
    error: '',
    loading: false,
});

const createSlotsState = () => ({
    error: '',
    loading: false,
    slots: [],
});

const createSubmitState = () => ({
    error: '',
    loading: false,
    message: '',
});

export function ChangeTimePage() {
    const navigate = useNavigate();
    const { addLog } = useDevLog();
    const {
        error: phoneError,
        loading: phoneLoading,
        phone,
        retry,
    } = useMaxUserPhone();
    const [searchParams] = useSearchParams();
    const tvsId = searchParams.get('tvsid') || '';
    const [datesReloadKey, setDatesReloadKey] = useState(0);
    const [slotsReloadKey, setSlotsReloadKey] = useState(0);
    const [datesState, setDatesState] = useState(createDatesState);
    const [submitState, setSubmitState] = useState(createSubmitState);
    const [slotsState, setSlotsState] = useState(createSlotsState);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const selectedDateItem = datesState.dates.find(
        (dateItem) => dateItem.date === selectedDate
    );
    const selectedSlot = slotsState.slots.find(
        (slot) => slot.slotId === selectedSlotId
    );

    useEffect(() => {
        let isActive = true;

        async function logOpen() {
            await Promise.resolve();

            if (isActive) {
                addLog('info', `Открыт экран переноса времени для ${tvsId}`);
            }
        }

        logOpen();

        return () => {
            isActive = false;
        };
    }, [addLog, tvsId]);

    useEffect(() => {
        if (phoneLoading || phoneError || !tvsId) {
            return;
        }

        let isActive = true;

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
            setSubmitState(createSubmitState());
            setSelectedDate('');
            setSelectedSlotId('');
            addLog('info', `Загрузка доступных дат для визита ${tvsId}`);

            try {
                const result = await getAvailableVisitDates(
                    tvsId,
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
                    `Доступных дат для визита ${tvsId}: ${
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
                addLog('error', `Ошибка загрузки дат: ${message}`);
            }
        }

        loadDates();

        return () => {
            isActive = false;
        };
    }, [addLog, datesReloadKey, phone, phoneError, phoneLoading, tvsId]);

    useEffect(() => {
        if (phoneLoading || phoneError || !tvsId || !selectedDate) {
            return;
        }

        let isActive = true;

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
                `Загрузка слотов для визита ${tvsId} на дату ${selectedDate}`
            );

            try {
                const result = await getAvailableVisitSlots(
                    tvsId,
                    selectedDate,
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
                    `Слотов на ${selectedDate}: ${result.slots?.length || 0}`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить слоты';

                setSlotsState({
                    error: message,
                    loading: false,
                    slots: [],
                });
                addLog('error', `Ошибка загрузки слотов: ${message}`);
            }
        }

        loadSlots();

        return () => {
            isActive = false;
        };
    }, [
        addLog,
        phone,
        phoneError,
        phoneLoading,
        selectedDate,
        tvsId,
        slotsReloadKey,
    ]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlotId('');
        setSubmitState(createSubmitState());
        setSlotsState(createSlotsState());
        addLog('action', `Выбрана дата переноса ${date}`);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlotId(slot.slotId);
        setSubmitState(createSubmitState());
        addLog(
            'action',
            `Выбран слот переноса ${selectedDate}: ${slot.slotId}`
        );
    };

    const handleConfirmSlot = async () => {
        if (!selectedSlot) {
            return;
        }

        setSubmitState({
            error: '',
            loading: true,
            message: '',
        });
        addLog(
            'action',
            `Подтверждение переноса визита ${tvsId}, slot_id ${selectedSlot.slotId}`
        );

        try {
            const result = await changeVisitSlot(
                tvsId,
                selectedSlot.slotId,
                requestOptions
            );

            setSubmitState({
                error: '',
                loading: false,
                message: result.message,
            });
            addLog(
                'info',
                `Слот визита изменён: ${result.slotId}, ${result.message}`
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось подтвердить выбор';

            setSubmitState({
                error: message,
                loading: false,
                message: '',
            });
            addLog('error', `Ошибка подтверждения слота: ${message}`);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Перенос времени
                    </h1>
                    <p className="page-description">
                        {tvsId ? `Визит #${tvsId}` : 'ID визита не передан'}
                    </p>
                </div>
            </div>

            <Panel className="section">
                {phoneLoading && (
                    <Loading text="Получаем телефон пользователя..." />
                )}

                {!phoneLoading && phoneError && (
                    <ErrorMessage message={phoneError} onRetry={retry} />
                )}

                {!phoneLoading && !phoneError && tvsId && (
                    <div className="time-picker">
                        <div className="time-picker-block">
                            <h2 className="section-title">Доступные даты</h2>

                            {datesState.loading && (
                                <Loading text="Загружаем даты..." />
                            )}

                            {!datesState.loading && datesState.error && (
                                <ErrorMessage
                                    message="Не удалось загрузить даты. Подробности в логах."
                                    onRetry={() =>
                                        setDatesReloadKey((key) => key + 1)
                                    }
                                />
                            )}

                            {!datesState.loading &&
                                !datesState.error &&
                                !datesState.dates.length && (
                                    <EmptyState text="Нет доступных дат" />
                                )}

                            {!datesState.loading &&
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
                            <h2 className="section-title">Слоты</h2>

                            {!selectedDate && (
                                <p className="placeholder-text">
                                    Выберите дату, чтобы увидеть доступные слоты.
                                </p>
                            )}

                            {selectedDate && slotsState.loading && (
                                <Loading text="Загружаем слоты..." />
                            )}

                            {selectedDate &&
                                !slotsState.loading &&
                                slotsState.error && (
                                    <ErrorMessage
                                        message="Не удалось загрузить слоты. Подробности в логах."
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
                                    <EmptyState text="Нет доступных слотов" />
                                )}

                            {selectedDate &&
                                !slotsState.loading &&
                                !slotsState.error &&
                                slotsState.slots.length > 0 && (
                                    <div className="slot-list">
                                        {slotsState.slots.map(
                                            (slot) => (
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
                                            )
                                        )}
                                    </div>
                                )}
                        </div>

                        {selectedDateItem && selectedSlot && (
                            <div className="confirm-slot">
                                <Button
                                    className="confirm-button"
                                    disabled={submitState.loading}
                                    onClick={handleConfirmSlot}
                                >
                                    {submitState.loading
                                        ? 'Отправляем...'
                                        : 'Подтвердить выбор'}
                                </Button>

                                {submitState.error && (
                                    <ErrorMessage
                                        message="Не удалось подтвердить выбор. Подробности в логах."
                                        onRetry={handleConfirmSlot}
                                    />
                                )}

                                {submitState.message && (
                                    <p className="status-message">
                                        {submitState.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!phoneLoading && !phoneError && !tvsId && (
                    <EmptyState text="ID визита не передан" />
                )}
            </Panel>

            <Flex className="nav-actions" gap={8}>
                <Button
                    className="secondary-button"
                    onClick={() => {
                        addLog('action', 'Назад с экрана переноса времени');
                        navigate(-1);
                    }}
                >
                    Назад
                </Button>
                <Button
                    className="secondary-button"
                    onClick={() => {
                        addLog('action', 'Домой с экрана переноса времени');
                        navigate(tvsId ? `/?tvsid=${tvsId}` : '/');
                    }}
                >
                    Домой
                </Button>
            </Flex>
        </Layout>
    );
}
