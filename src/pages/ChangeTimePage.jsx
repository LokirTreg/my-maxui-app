import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
    getAvailableVisitDates,
    getAvailableVisitTimeWindows,
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

const createWindowsState = () => ({
    error: '',
    loading: false,
    windows: [],
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
    const [windowsReloadKey, setWindowsReloadKey] = useState(0);
    const [datesState, setDatesState] = useState(createDatesState);
    const [windowsState, setWindowsState] = useState(createWindowsState);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedWindowId, setSelectedWindowId] = useState('');
    const selectedDateItem = datesState.dates.find(
        (dateItem) => dateItem.date === selectedDate
    );
    const selectedWindow = windowsState.windows.find(
        (windowItem) => windowItem.id === selectedWindowId
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
            setWindowsState(createWindowsState());
            setSelectedDate('');
            setSelectedWindowId('');
            addLog('info', `Загрузка доступных дат для визита ${tvsId}`);

            try {
                const result = await getAvailableVisitDates(
                    tvsId,
                    phone,
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

        async function loadWindows() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            setWindowsState({
                error: '',
                loading: true,
                windows: [],
            });
            setSelectedWindowId('');
            addLog(
                'info',
                `Загрузка окон для визита ${tvsId} на дату ${selectedDate}`
            );

            try {
                const result = await getAvailableVisitTimeWindows(
                    tvsId,
                    selectedDate,
                    phone,
                    requestOptions
                );

                if (!isActive) {
                    return;
                }

                setWindowsState({
                    error: '',
                    loading: false,
                    windows: result.windows || [],
                });
                addLog(
                    'info',
                    `Окон на ${selectedDate}: ${result.windows?.length || 0}`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить временные окна';

                setWindowsState({
                    error: message,
                    loading: false,
                    windows: [],
                });
                addLog('error', `Ошибка загрузки окон: ${message}`);
            }
        }

        loadWindows();

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
        windowsReloadKey,
    ]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedWindowId('');
        setWindowsState(createWindowsState());
        addLog('action', `Выбрана дата переноса ${date}`);
    };

    const handleWindowSelect = (windowItem) => {
        setSelectedWindowId(windowItem.id);
        addLog(
            'action',
            `Выбрано окно переноса ${selectedDate}: ${windowItem.value}`
        );
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
                            <h2 className="section-title">Временные окна</h2>

                            {!selectedDate && (
                                <p className="placeholder-text">
                                    Выберите дату, чтобы увидеть доступное время.
                                </p>
                            )}

                            {selectedDate && windowsState.loading && (
                                <Loading text="Загружаем временные окна..." />
                            )}

                            {selectedDate &&
                                !windowsState.loading &&
                                windowsState.error && (
                                    <ErrorMessage
                                        message="Не удалось загрузить временные окна. Подробности в логах."
                                        onRetry={() =>
                                            setWindowsReloadKey(
                                                (key) => key + 1
                                            )
                                        }
                                    />
                                )}

                            {selectedDate &&
                                !windowsState.loading &&
                                !windowsState.error &&
                                !windowsState.windows.length && (
                                    <EmptyState text="Нет доступных временных окон" />
                                )}

                            {selectedDate &&
                                !windowsState.loading &&
                                !windowsState.error &&
                                windowsState.windows.length > 0 && (
                                    <div className="slot-list">
                                        {windowsState.windows.map(
                                            (windowItem) => (
                                                <Button
                                                    className={`slot-button ${
                                                        selectedWindowId ===
                                                        windowItem.id
                                                            ? 'selected'
                                                            : ''
                                                    }`}
                                                    key={windowItem.id}
                                                    onClick={() =>
                                                        handleWindowSelect(
                                                            windowItem
                                                        )
                                                    }
                                                >
                                                    {windowItem.label}
                                                </Button>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>

                        {selectedDateItem && selectedWindow && (
                            <p className="status-message">
                                Выбрано: {selectedDateItem.label},{' '}
                                {selectedWindow.label}
                            </p>
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
