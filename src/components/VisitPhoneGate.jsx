import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@maxhub/max-ui';
import { useMaxUserPhone } from '../user/useMaxUserPhone';
import { PhoneRequestForm } from '../user/PhoneRequestForm';
import { Loading } from './Loading';
import { ErrorMessage } from './ErrorMessage';

// The visitor phone is separate from the signed-in operator's profile.
export function VisitPhoneGate({ children }) {
    const { phone, userId, role, loading, error, retry } = useMaxUserPhone();
    const location = useLocation();
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState(null);
    const savedPhone = location.state?.bookingUserId === userId
        ? location.state?.visitPhone : '';
    const visitPhone = visitor?.userId === userId ? visitor.phone : savedPhone;
    if (loading) return <Loading text="Получаем профиль пользователя..." />;
    if (error) return <ErrorMessage message={error} onRetry={retry} />;
    if (role !== 'sto') return children(phone);
    if (!/^\d{10,15}$/.test(visitPhone || '')) {
        return (
            <>
                <PhoneRequestForm
                    title="Зарегистрировать визит"
                    description="Укажите телефон водителя, для которого оформляется визит."
                    onSubmit={(value) => setVisitor({ userId, phone: value })}
                />
                <Button className="secondary-button" onClick={() => navigate(-1)}>Назад</Button>
            </>
        );
    }
    return children(visitPhone);
}
