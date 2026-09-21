import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUserByPhone } from '../api/processApi';
import { getRequestOptions } from '../api/requestOptions';
import { useDevLog } from '../logs/useDevLog';
import { MaxUserPhoneContext } from './maxUserPhoneContext';
import { PhoneRequestForm } from './PhoneRequestForm';

const createInitialState = () => ({
    error: '', loading: true, manualEntryRequired: false,
    maxUser: null, maxUserId: '', phone: '', role: '', userId: '', source: '',
});

// API field names are preserved in the request; map to UI names here.
const toProfile = (result) => ({
    userId: result.userid, role: result.role,
    maxUserId: result.maxid, phone: result.phone,
});

export function MaxUserPhoneProvider({ children }) {
    const { addLog } = useDevLog();
    const [state, setState] = useState(createInitialState);
    const [reloadKey, setReloadKey] = useState(0);
    const submitting = useRef(false);
    const generation = useRef(0);

    useEffect(() => {
        const currentGeneration = ++generation.current;
        let active = true;
        async function resolveUser() {
            await Promise.resolve();
            if (!active) return;
            const maxUser = window.WebApp?.initDataUnsafe?.user || null;
            const maxId = String(maxUser?.id ?? '');
            setState({ ...createInitialState(), maxUser, maxUserId: maxId,
                loading: Boolean(maxId), manualEntryRequired: !maxId });
            if (!maxId) return;
            try {
                const result = await getUserByPhone('', maxId, getRequestOptions());
                if (!active || generation.current !== currentGeneration) return;
                setState({ ...createInitialState(), ...toProfile(result), maxUser,
                    loading: false, source: 'process' });
                addLog('info', 'Профиль пользователя получен по MAX ID');
            } catch (error) {
                if (!active || generation.current !== currentGeneration) return;
                addLog('error', error instanceof Error ? error.message : 'Ошибка профиля');
                setState({ ...createInitialState(), maxUser, maxUserId: maxId,
                    loading: false, manualEntryRequired: true,
                    error: 'Не удалось получить профиль по MAX ID. Укажите телефон.' });
            }
        }
        resolveUser();
        return () => { active = false; generation.current = currentGeneration + 1; };
    }, [addLog, reloadKey]);

    const retry = useCallback(() => setReloadKey((key) => key + 1), []);
    const submitPhone = useCallback(async (phone) => {
        if (submitting.current) return;
        submitting.current = true;
        const currentGeneration = generation.current;
        setState((current) => ({ ...current, error: '', loading: true }));
        try {
            // Resolve by phone alone; do not attach an unverified MAX identity.
            const result = await getUserByPhone(String(phone).replace(/\D/g, ''), '', getRequestOptions());
            if (generation.current !== currentGeneration) return;
            setState((current) => ({ ...current, ...toProfile(result),
                error: '', loading: false, manualEntryRequired: false, source: 'manual' }));
            addLog('info', 'Профиль пользователя получен по телефону');
        } catch (error) {
            if (generation.current !== currentGeneration) return;
            addLog('error', error instanceof Error ? error.message : 'Ошибка профиля');
            setState((current) => ({ ...current, loading: false,
                error: 'Не удалось получить профиль. Проверьте телефон и повторите.' }));
        } finally {
            submitting.current = false;
        }
    }, [addLog]);

    const value = useMemo(() => ({ ...state, retry, submitPhone }), [state, retry, submitPhone]);
    return (
        <MaxUserPhoneContext.Provider value={value}>
            {state.manualEntryRequired ? (
                <PhoneRequestForm error={state.error} loading={state.loading} onSubmit={submitPhone} />
            ) : children}
        </MaxUserPhoneContext.Provider>
    );
}
