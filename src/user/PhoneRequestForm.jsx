import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

const formatPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 15);

    if (!digits) {
        return '';
    }

    return `+${digits}`;
};

export function PhoneRequestForm({ error, loading, onSubmit }) {
    const [phone, setPhone] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const digits = phone.replace(/\D/g, '');

        if (digits.length < 10 || digits.length > 15) {
            setValidationError('Введите номер телефона: от 10 до 15 цифр');
            return;
        }

        setValidationError('');
        await onSubmit(digits);
    };

    return (
        <main className="app">
            <div className="app-shell">
                <section className="section phone-request">
                    <div>
                        <h1 className="page-title">Укажите номер телефона</h1>
                        <p className="page-description">
                            Не удалось получить номер автоматически. Он нужен,
                            чтобы найти ваши визиты и оформить новый.
                        </p>
                    </div>

                    <form className="phone-request-form" onSubmit={handleSubmit}>
                        <label className="form-field">
                            <span className="select-label">Номер телефона</span>
                            <input
                                autoComplete="tel"
                                autoFocus
                                className="form-control"
                                disabled={loading}
                                inputMode="tel"
                                name="phone"
                                onChange={(event) => {
                                    setPhone(formatPhone(event.target.value));
                                    setValidationError('');
                                }}
                                placeholder="+7 999 123-45-67"
                                type="tel"
                                value={phone}
                            />
                        </label>

                        {(validationError || error) && (
                            <p className="phone-request-error" role="alert">
                                {validationError || error}
                            </p>
                        )}

                        <Button
                            className="confirm-button"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? 'Сохраняем...' : 'Продолжить'}
                        </Button>
                    </form>
                </section>
            </div>
        </main>
    );
}
