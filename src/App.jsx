import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';
import { useMaxWebApp } from './hooks/1';
import { Arrival } from './pages/Arrival';
import { useState, useEffect, useRef } from 'react';

function App() {
    const { webApp, user } = useMaxWebApp();
    const [info, setInfo] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const hasRequested = useRef(false); // Флаг для предотвращения дублирования

    useEffect(() => {
        // Предотвращаем повторный запрос
        if (hasRequested.current) return;
        
        let t = "";
        
        if (webApp) {
            t += "WebApp есть ";
        }
        if (user) {
            t += "user есть ";
        }
        
        let oldPhone = localStorage.getItem('phone');
        if (oldPhone) {
            t += "телефон уже был: " + oldPhone + " ";
            setPhoneNumber(oldPhone);
            setInfo(t);
            return; // Если телефон уже есть, не запрашиваем снова
        }
        
        if (window.WebApp && !hasRequested.current) {
            hasRequested.current = true; // Устанавливаем флаг до запроса
            t += "window.WebApp есть ";
            setInfo(t);
            
            window.WebApp.requestContact()
                .then(({phone}) => {
                    localStorage.setItem('phone', phone);
                    setPhoneNumber(phone);
                    setInfo(prev => prev + "Номер телефона пользователя: " + phone);
                })
                .catch(error => {
                    console.error("Ошибка запроса контакта:", error);
                    setInfo(prev => prev + "Ошибка получения телефона");
                    hasRequested.current = false; // Сбрасываем флаг при ошибке
                });
        } else {
            setInfo(t);
        }
    }, [webApp, user]); // Зависимости

    return (
        <Panel className="panel">
            <Arrival warehouseName="ворота" />
            <Panel mode="secondary" id="panel">
                {info}
                {phoneNumber && <div>Телефон: {phoneNumber}</div>}
            </Panel>
        </Panel>
    );
}

export default App;