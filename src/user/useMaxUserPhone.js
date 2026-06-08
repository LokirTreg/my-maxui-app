import { useContext } from 'react';

import { MaxUserPhoneContext } from './maxUserPhoneContext';

export function useMaxUserPhone() {
    const context = useContext(MaxUserPhoneContext);

    if (!context) {
        throw new Error('useMaxUserPhone must be used inside MaxUserPhoneProvider');
    }

    return context;
}
