import { Button, Flex, Panel } from '@maxhub/max-ui';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
    createUnplannedVisit,
    getUnplannedVisitCreationForm,
} from '../api/processApi';
import { getRequestOptions, isMockApiMode } from '../api/requestOptions';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { useDevLog } from '../logs/useDevLog';
import { useMaxUserPhone } from '../user/useMaxUserPhone';

const requestOptions = getRequestOptions();
const VEHICLE_NUMBER_PATTERN =
    /^[АВЕКМНОРСТУХABEKMHOPCTYX]\d{3}[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}$/i;

const createFormState = () => ({
    date: '',
    error: '',
    fields: [],
    loading: false,
    purposes: [],
    time: '',
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

export function UnplannedVisitCreationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reservationId = searchParams.get('reservationid') || '';
    const { addLog } = useDevLog();
    const {
        error: phoneError,
        loading: phoneLoading,
        maxUserId,
        phone,
        retry,
    } = useMaxUserPhone();
    const [reloadKey, setReloadKey] = useState(0);
    const [formState, setFormState] = useState(createFormState);
    const [submitState, setSubmitState] = useState(createSubmitState);
    const [values, setValues] = useState({});
    const [ignoredMasks, setIgnoredMasks] = useState({});
    const [selectedPurposes, setSelectedPurposes] = useState([]);

    const missingRequiredFields = useMemo(
        () =>
            formState.fields.filter(
                (field) => field.required && !String(values[field.id] || '').trim()
            ),
        [formState.fields, values]
    );

    useEffect(() => {
        if (
            !reservationId ||
            phoneLoading ||
            phoneError ||
            !phone
        ) {
            return;
        }

        let isActive = true;

        async function loadForm() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            setFormState({ ...createFormState(), loading: true });
            setSubmitState(createSubmitState());
            addLog('info', `Загрузка формы создания, резерв ${reservationId}`);

            try {
                const result = await getUnplannedVisitCreationForm(
                    phone,
                    maxUserId,
                    reservationId,
                    requestOptions
                );

                if (!isActive) {
                    return;
                }

                const initialValues = Object.fromEntries(
                    (result.fields || []).map((field) => [
                        field.id,
                        field.id === 'driver_phone' ? phone : '',
                    ])
                );

                setValues(initialValues);
                setIgnoredMasks({});
                setSelectedPurposes([]);
                setFormState({
                    date: result.date || '',
                    error: '',
                    fields: result.fields || [],
                    loading: false,
                    purposes: result.purposes || [],
                    time: result.time || '',
                });
                addLog(
                    'info',
                    `Форма создания загружена: ${result.fields?.length || 0} полей`
                );
            } catch (error) {
                if (!isActive) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить форму создания';

                setFormState({
                    ...createFormState(),
                    error: message,
                });
                addLog('error', `Ошибка формы создания визита: ${message}`);
            }
        }

        loadForm();

        return () => {
            isActive = false;
        };
    }, [
        addLog,
        maxUserId,
        phone,
        phoneError,
        phoneLoading,
        reloadKey,
        reservationId,
    ]);

    const handleValueChange = (fieldId, value) => {
        setValues((current) => ({ ...current, [fieldId]: value }));
        setSubmitState(createSubmitState());
    };

    const handlePurposeChange = (purposeId, checked) => {
        setSelectedPurposes((current) =>
            checked
                ? [...new Set([...current, purposeId])]
                : current.filter((id) => id !== purposeId)
        );
        setSubmitState(createSubmitState());
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (missingRequiredFields.length > 0) {
            setSubmitState({
                error: `Заполните обязательные поля: ${missingRequiredFields
                    .map((field) => field.name)
                    .join(', ')}`,
                loading: false,
            });
            return;
        }

        const vehicleNumberField = formState.fields.find(
            (field) => field.id === 'vehicle_number'
        );
        const vehicleNumber = String(values.vehicle_number || '')
            .replace(/\s/g, '')
            .toUpperCase();

        if (
            vehicleNumberField &&
            vehicleNumber &&
            !ignoredMasks.vehicle_number &&
            !VEHICLE_NUMBER_PATTERN.test(vehicleNumber)
        ) {
            setSubmitState({
                error: 'Проверьте формат гос. номера или отметьте иностранный номер',
                loading: false,
            });
            return;
        }

        if (formState.purposes.length > 0 && selectedPurposes.length === 0) {
            setSubmitState({
                error: 'Выберите цель визита',
                loading: false,
            });
            return;
        }

        const fields = { ...values };

        Object.entries(ignoredMasks).forEach(([fieldId, ignored]) => {
            fields[`${fieldId}_ignore_mask`] = ignored;
        });

        setSubmitState({ error: '', loading: true });
        addLog('action', `Создание визита по резерву ${reservationId}`);

        try {
            const result = await createUnplannedVisit(
                phone,
                maxUserId,
                reservationId,
                fields,
                selectedPurposes,
                requestOptions
            );

            if (!result.ok) {
                throw new Error(result.message || 'Не удалось создать визит');
            }

            addLog('info', `Незапланированный визит создан: ${result.tvsId}`);
            navigate(buildVisitPageUrl(result.tvsId), { replace: true });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось создать визит';

            setSubmitState({ error: message, loading: false });
            addLog('error', `Ошибка создания незапланированного визита: ${message}`);
        }
    };

    const renderField = (field) => {
        if (field.type === 'select') {
            return (
                <select
                    className="select-control"
                    id={`creation-field-${field.id}`}
                    required={field.required}
                    value={values[field.id] || ''}
                    onChange={(event) =>
                        handleValueChange(field.id, event.target.value)
                    }
                >
                    <option value="">Выберите значение</option>
                    {field.options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <input
                className="form-control"
                id={`creation-field-${field.id}`}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
                min={field.type === 'number' ? '0' : undefined}
                placeholder={field.placeholder}
                required={field.required}
                type={['number', 'tel'].includes(field.type) ? field.type : 'text'}
                value={values[field.id] || ''}
                onChange={(event) =>
                    handleValueChange(field.id, event.target.value)
                }
            />
        );
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Создание визита</h1>
                    <p className="page-description">
                        Заполните данные водителя и транспорта
                    </p>
                </div>
            </div>

            {!reservationId && (
                <Panel className="section">
                    <EmptyState text="Не указан резерв времени" />
                </Panel>
            )}

            {reservationId && phoneLoading && (
                <Panel className="section">
                    <Loading text="Получаем телефон пользователя..." />
                </Panel>
            )}

            {reservationId && !phoneLoading && phoneError && (
                <Panel className="section">
                    <ErrorMessage message={phoneError} onRetry={retry} />
                </Panel>
            )}

            {reservationId && !phoneLoading && !phoneError && formState.loading && (
                <Panel className="section">
                    <Loading text="Загружаем форму создания..." />
                </Panel>
            )}

            {reservationId &&
                !phoneLoading &&
                !phoneError &&
                !formState.loading &&
                formState.error && (
                    <Panel className="section">
                        <ErrorMessage
                            message="Не удалось загрузить форму. Подробности в логах."
                            onRetry={() => setReloadKey((key) => key + 1)}
                        />
                    </Panel>
                )}

            {reservationId &&
                !phoneLoading &&
                !phoneError &&
                !formState.loading &&
                !formState.error &&
                formState.fields.length > 0 && (
                    <form className="creation-form" onSubmit={handleSubmit}>
                        <Panel className="section reserved-slot-summary">
                            <div>
                                <span className="field-label">Дата визита</span>
                                <strong>{formState.date || 'Уточняется'}</strong>
                            </div>
                            <div>
                                <span className="field-label">Время визита</span>
                                <strong>{formState.time || 'Уточняется'}</strong>
                            </div>
                        </Panel>

                        <Panel className="section creation-fields">
                            {formState.fields.map((field) => (
                                <div className="form-field" key={field.id}>
                                    <label
                                        className="select-label"
                                        htmlFor={`creation-field-${field.id}`}
                                    >
                                        {field.name}
                                        {field.required ? ' *' : ''}
                                    </label>
                                    {renderField(field)}
                                    {field.hint && (
                                        <span className="form-hint">{field.hint}</span>
                                    )}
                                    {field.canIgnoreMask && (
                                        <label className="checkbox-field">
                                            <input
                                                checked={Boolean(
                                                    ignoredMasks[field.id]
                                                )}
                                                type="checkbox"
                                                onChange={(event) =>
                                                    setIgnoredMasks((current) => ({
                                                        ...current,
                                                        [field.id]:
                                                            event.target.checked,
                                                    }))
                                                }
                                            />
                                            <span>Номер иностранного государства</span>
                                        </label>
                                    )}
                                </div>
                            ))}

                            {formState.purposes.length > 0 && (
                                <fieldset className="purpose-fieldset">
                                    <legend className="select-label">
                                        Цель визита *
                                    </legend>
                                    {formState.purposes.map((purpose) => (
                                        <label
                                            className="checkbox-field"
                                            key={purpose.id}
                                        >
                                            <input
                                                checked={selectedPurposes.includes(
                                                    purpose.id
                                                )}
                                                type="checkbox"
                                                onChange={(event) =>
                                                    handlePurposeChange(
                                                        purpose.id,
                                                        event.target.checked
                                                    )
                                                }
                                            />
                                            <span>{purpose.name}</span>
                                        </label>
                                    ))}
                                </fieldset>
                            )}
                        </Panel>

                        {submitState.error && (
                            <ErrorMessage message={submitState.error} />
                        )}

                        <Button
                            className="confirm-button"
                            disabled={submitState.loading}
                            type="submit"
                        >
                            {submitState.loading ? 'Создаём визит...' : 'Завершить'}
                        </Button>
                    </form>
                )}

            <Flex className="nav-actions" gap={8}>
                <Button className="secondary-button" onClick={() => navigate(-1)}>
                    Назад
                </Button>
                <Button className="secondary-button" onClick={() => navigate('/')}>
                    Домой
                </Button>
            </Flex>
        </Layout>
    );
}
