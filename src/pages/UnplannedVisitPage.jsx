import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    createUnplannedVisit,
    getUnplannedVisitForm,
    getUnplannedVisitSlots,
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
    } = useMaxUserPhone();
    const [fieldsReloadKey, setFieldsReloadKey] = useState(0);
    const [slotsReloadKey, setSlotsReloadKey] = useState(0);
    const [fieldsState, setFieldsState] = useState(createFieldsState);
    const [slotsState, setSlotsState] = useState(createSlotsState);
    const [submitState, setSubmitState] = useState(createSubmitState);
    const [selectedValues, setSelectedValues] = useState({});
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
            setSlotsState(createSlotsState());
            setSubmitState(createSubmitState());
            setSelectedValues({});
            setSelectedSlotId('');
            addLog('info', `Загрузка формы незапланированного визита для ${phone}`);

            try {
                const result = await getUnplannedVisitForm(
                    phone,
                    maxUserId,
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
    ]);

    useEffect(() => {
        if (phoneLoading || phoneError || !phone || !allFieldsSelected) {
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
        slotsReloadKey,
    ]);

    const handleFieldChange = (fieldId, value) => {
        setSelectedValues((current) => ({
            ...current,
            [fieldId]: value,
        }));
        setSlotsState(createSlotsState());
        setSubmitState(createSubmitState());
        setSelectedSlotId('');
        addLog('action', `Выбор поля ${fieldId}: ${value || '<empty>'}`);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlotId(slot.slotId);
        setSubmitState(createSubmitState());
        addLog('action', `Выбран слот незапланированного визита: ${slot.slotId}`);
    };

    const handleCreateVisit = async () => {
        if (!selectedSlot) {
            return;
        }

        setSubmitState({
            error: '',
            loading: true,
        });
        addLog(
            'action',
            `Создание незапланированного визита, slot_id ${selectedSlot.slotId}`
        );

        try {
            const result = await createUnplannedVisit(
                phone,
                maxUserId,
                selectedValues,
                selectedSlot.slotId,
                requestOptions
            );

            if (!result.ok) {
                throw new Error(result.message || 'Не удалось создать визит');
            }

            addLog(
                'info',
                `Незапланированный визит создан: ${result.tvsId}, ${result.message}`
            );
            navigate(buildVisitPageUrl(result.tvsId));
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось создать визит';

            setSubmitState({
                error: message,
                loading: false,
            });
            addLog('error', `Ошибка создания незапланированного визита: ${message}`);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Незапланированный визит
                    </h1>
                    <p className="page-description">
                        MAX user: {maxUserId || '...'}
                        {phone && `, телефон: ${phone}`}
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
                                <h2 className="section-title">Доступное время</h2>

                                {!allFieldsSelected && (
                                    <p className="placeholder-text">
                                        Выберите все параметры, чтобы увидеть время.
                                    </p>
                                )}

                                {allFieldsSelected && slotsState.loading && (
                                    <Loading text="Загружаем время..." />
                                )}

                                {allFieldsSelected &&
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

                                {allFieldsSelected &&
                                    !slotsState.loading &&
                                    !slotsState.error &&
                                    !slotsState.slots.length && (
                                        <EmptyState text="Нет доступного времени" />
                                    )}

                                {allFieldsSelected &&
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

                            {selectedSlot && (
                                <div className="confirm-slot">
                                    <Button
                                        className="confirm-button"
                                        disabled={submitState.loading}
                                        onClick={handleCreateVisit}
                                    >
                                        {submitState.loading
                                            ? 'Создаём...'
                                            : 'Подтвердить время'}
                                    </Button>

                                    {submitState.error && (
                                        <ErrorMessage
                                            message="Не удалось создать визит. Подробности в логах."
                                            onRetry={handleCreateVisit}
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
