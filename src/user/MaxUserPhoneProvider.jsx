import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    getPhoneByMaxUserId,
    savePhoneByMaxUserId,
} from '../api/processApi';
import { useDevLog } from '../logs/useDevLog';
import { MaxUserPhoneContext } from './maxUserPhoneContext';

const DEV_MAX_USER = {
    first_name: 'Dev',
    id: 100500,
};

const DEV_PHONE = '79012345678';

const createInitialState = () => ({
    error: '',
    loading: true,
    maxUser: null,
    maxUserId: '',
    phone: '',
    source: '',
});

const getWebApp = () =>
    typeof window !== 'undefined' && window.WebApp ? window.WebApp : null;

const getInitUser = () => {
    const webApp = getWebApp();
    return webApp?.initDataUnsafe?.user || null;
};

const normalizePhone = (phone) => String(phone || '').replace(/[^\d+]/g, '');

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
            }));

            const webApp = getWebApp();
            const initUser = getInitUser();
            const maxUser = initUser || DEV_MAX_USER;
            const maxUserId = String(maxUser?.id || '');

            if (!initUser) {
                addLog(
                    'info',
                    `MAX Bridge initDataUnsafe.user недоступен, используем dev maxUserId ${maxUserId}`
                );
            } else {
                addLog('info', `MAX user id из initDataUnsafe: ${maxUserId}`);
            }

            if (!maxUserId) {
                const message = 'Не удалось получить MAX user id';
                setState({
                    error: message,
                    loading: false,
                    maxUser,
                    maxUserId: '',
                    phone: '',
                    source: '',
                });
                addLog('error', message);
                return;
            }

            try {
                addLog('info', `Process: запрос телефона для maxUserId ${maxUserId}`);
                const dbResult = await getPhoneByMaxUserId(maxUserId);
                const dbPhone = normalizePhone(dbResult.phone);

                if (dbPhone) {
                    setState({
                        error: '',
                        loading: false,
                        maxUser,
                        maxUserId,
                        phone: dbPhone,
                        source: 'process',
                    });
                    addLog('info', `Телефон получен из Process: ${dbPhone}`);
                    return;
                }

                addLog(
                    'info',
                    `Process: телефон для maxUserId ${maxUserId} не найден`
                );

                if (webApp && typeof webApp.requestContact === 'function') {
                    addLog('action', 'MAX Bridge: requestContact()');
                    const contact = await webApp.requestContact();
                    const bridgePhone = normalizePhone(contact?.phone);

                    if (!bridgePhone) {
                        throw new Error('MAX Bridge не вернул телефон');
                    }

                    await savePhoneByMaxUserId(maxUserId, bridgePhone);

                    setState({
                        error: '',
                        loading: false,
                        maxUser,
                        maxUserId,
                        phone: bridgePhone,
                        source: 'bridge',
                    });
                    addLog(
                        'info',
                        `Телефон получен из MAX Bridge и сохранён в Process: ${bridgePhone}`
                    );
                    return;
                }

                addLog(
                    'info',
                    `MAX Bridge requestContact недоступен, используем dev phone ${DEV_PHONE}`
                );

                await savePhoneByMaxUserId(maxUserId, DEV_PHONE);

                setState({
                    error: '',
                    loading: false,
                    maxUser,
                    maxUserId,
                    phone: DEV_PHONE,
                    source: 'dev',
                });
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось получить телефон пользователя';

                setState({
                    error: message,
                    loading: false,
                    maxUser,
                    maxUserId,
                    phone: '',
                    source: '',
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

    const value = useMemo(
        () => ({
            ...state,
            retry,
        }),
        [retry, state]
    );

    return (
        <MaxUserPhoneContext.Provider value={value}>
            {children}
        </MaxUserPhoneContext.Provider>
    );
}
