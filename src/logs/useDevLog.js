import { useContext } from 'react';

import { DevLogContext } from './devLogContext';

export function useDevLog() {
    const context = useContext(DevLogContext);

    if (!context) {
        throw new Error('useDevLog must be used inside DevLogProvider');
    }

    return context;
}
