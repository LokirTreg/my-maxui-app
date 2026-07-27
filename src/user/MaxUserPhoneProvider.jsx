import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    getPhoneByMaxUserId,
    getUserIdByPhone,
    savePhoneByMaxUserId,
} from '../api/processApi';
import { getRequestOptions } from '../api/requestOptions';
import { useDevLog } from '../logs/useDevLog';
import { MaxUserPhoneContext } from './maxUserPhoneContext';
import { PhoneRequestForm } from './PhoneRequestForm';

const requestOptions = getRequestOptions();

const createInitialState = () => ({
    error: '',
    loading: true,
    manualEntryRequired: false,
    maxUser: null,
    maxUserId: '',
    phone: '',
    source: '',
    userId: '',
});

const getWebApp = () =>
    typeof window !== 'undefined' && window.WebApp ? window.WebApp : null;

const getInitUser = () => {
    const webApp = getWebApp();
    return webApp?.initDataUnsafe?.user || null;
};
const getChatId = () => {
    const webApp = getWebApp();
    return webApp?.initDataUnsafe?.chat?.id || null;
};

const normalizePhone = (phone) => String(phone || '').replace(/[^\d+]/g, '');

const requestUserId = async (phone, addLog) => {
    addLog('info', `Process: запрос userId для телефона ${phone}`);
    const result = await getUserIdByPhone(phone, requestOptions);
    const userId = String(result.userId || '');
    addLog('info', `Process: получен userId ${userId}`);
    return userId;
};

export function MaxUserPhoneProvider({ children }) {
    const { addLog } = useDevLog();
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState(createInitialState);

    useEffect(() => {
        let isActive = true;

        async function resolvePhone() {
            await Promise.resolve();

            if (!isActive) {
                return;
            }

            setState((current) => ({
                ...current,
                error: '',
                loading: true,
                manualEntryRequired: false,
            }));

            const webApp = getWebApp();
            const initUser = getInitUser();
            const maxUser = initUser;
            const maxUserId = String(maxUser?.id || '');
            const chatId = String(getChatId() || '');
                
            if (!initUser) {
                addLog(
                    'warn',
                    'MAX Bridge initDataUnsafe.user недоступен, запрашиваем телефон'
                );
            } else {
                addLog('info', `MAX user id из initDataUnsafe: ${maxUserId}`);
            }

            if (!maxUserId) {
                setState({
                    error: '',
                    loading: false,
                    manualEntryRequired: true,
                    maxUser,
                    maxUserId: '',
                    phone: '',
                    source: '',
                    userId: '',
                });
                addLog(
                    'info',
                    'Показываем форму телефона для поиска данных без maxUserId'
                );
                return;
            }

            try {
                addLog('info', `Process: запрос телефона для maxUserId ${maxUserId}`);
                const dbResult = await getPhoneByMaxUserId(
                    maxUserId,
                    requestOptions
                );
                const dbPhone = normalizePhone(dbResult.phone);

                if (dbPhone) {
                    const userId = await requestUserId(dbPhone, addLog);

                    setState({
                        error: '',
                        loading: false,
                        manualEntryRequired: false,
                        maxUser,
                        maxUserId,
                        phone: dbPhone,
                        source: 'process',
                        userId,
                    });
                    addLog('info', `Телефон получен из Process: ${dbPhone}`);
                    return;
                }

                addLog(
                    'info',
                    `Process: телефон для maxUserId ${maxUserId} не найден`
                );
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось проверить телефон в Process';
                addLog(
                    'warn',
                    `Не удалось получить телефон из Process: ${message}`
                );
            }

            try {
                if (
                    initUser &&
                    webApp &&
                    typeof webApp.requestContact === 'function'
                ) {
                    try {
                        addLog('action', 'MAX Bridge: requestContact()');
                        const contact = await webApp.requestContact();
                        const bridgePhone = normalizePhone(contact?.phone);

                        if (!bridgePhone) {
                            throw new Error('MAX Bridge не вернул телефон');
                        }

                        const userId = await requestUserId(
                            bridgePhone,
                            addLog
                        );
                        await savePhoneByMaxUserId(
                            maxUserId,
                            bridgePhone,
                            chatId,
                            userId,
                            requestOptions
                        );

                        setState({
                            error: '',
                            loading: false,
                            manualEntryRequired: false,
                            maxUser,
                            maxUserId,
                            phone: bridgePhone,
                            source: 'bridge',
                            userId,
                        });
                        addLog(
                            'info',
                            `Телефон получен из MAX Bridge и сохранён в Process: ${bridgePhone}`
                        );
                        return;
                    } catch (error) {
                        const message =
                            error instanceof Error
                                ? error.message
                                : 'MAX Bridge не вернул телефон';
                        addLog(
                            'warn',
                            `Не удалось получить телефон из MAX Bridge: ${message}`
                        );
                    }
                } else {
                    addLog(
                        'info',
                        'MAX Bridge requestContact недоступен без активного пользователя MAX'
                    );
                }

                setState({
                    error: '',
                    loading: false,
                    manualEntryRequired: true,
                    maxUser,
                    maxUserId,
                    phone: '',
                    source: '',
                    userId: '',
                });
                addLog('info', 'Показываем форму ручного ввода телефона');
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось получить телефон пользователя';

                setState({
                    error: message,
                    loading: false,
                    manualEntryRequired: false,
                    maxUser,
                    maxUserId,
                    phone: '',
                    source: '',
                    userId: '',
                });
                addLog('error', `Ошибка получения телефона: ${message}`);
            }
        }

        resolvePhone();

        return () => {
            isActive = false;
        };
    }, [addLog, reloadKey]);

    const retry = useCallback(() => {
        setReloadKey((key) => key + 1);
    }, []);

    const submitPhone = useCallback(
        async (phone) => {
            const normalizedPhone = normalizePhone(phone).replace(/\D/g, '');

            setState((current) => ({
                ...current,
                error: '',
                loading: true,
            }));

            try {
                const userId = await requestUserId(normalizedPhone, addLog);

                if (state.maxUserId) {
                    await savePhoneByMaxUserId(
                        state.maxUserId,
                        normalizedPhone,
                        String(getChatId() || ''),
                        userId,
                        requestOptions
                    );
                }

                setState((current) => ({
                    ...current,
                    error: '',
                    loading: false,
                    manualEntryRequired: false,
                    phone: normalizedPhone,
                    source: 'manual',
                    userId,
                }));
                addLog(
                    'info',
                    state.maxUserId
                        ? `Телефон введён пользователем и сохранён в Process: ${normalizedPhone}`
                        : `Телефон введён пользователем, ищем данные по номеру: ${normalizedPhone}`
                );
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось сохранить номер телефона';

                setState((current) => ({
                    ...current,
                    error: message,
                    loading: false,
                }));
                addLog('error', `Ошибка сохранения телефона: ${message}`);
            }
        },
        [addLog, state.maxUserId]
    );

    const value = useMemo(
        () => ({
            ...state,
            retry,
            submitPhone,
        }),
        [retry, state, submitPhone]
    );

    return (
        <MaxUserPhoneContext.Provider value={value}>
            {state.manualEntryRequired ? (
                <PhoneRequestForm
                    error={state.error}
                    loading={state.loading}
                    onSubmit={submitPhone}
                />
            ) : (
                children
            )}
        </MaxUserPhoneContext.Provider>
    );
}
