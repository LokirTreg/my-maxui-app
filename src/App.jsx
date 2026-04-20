import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';
import { useMaxWebApp } from './hooks/1';
import { Arrival } from './pages/Arrival';
import { DevBox } from './elements/DevBox';
import { useState, useEffect, useRef } from 'react';

function App() {
    const { webApp, user } = useMaxWebApp();
    const [infoElements, setInfoElements] = useState([]); // Массив элементов
    const [phoneNumber, setPhoneNumber] = useState("");
    const hasRequested = useRef(false);

    useEffect(() => {
        if (hasRequested.current) return;
                
        if (window.WebApp && !hasRequested.current) {
            hasRequested.current = true;
            
            // Добавляем первый элемент
            setInfoElements([
                <Typography.Body key="webapp">window.WebApp успешно подключен</Typography.Body>
            ]);
            
            window.WebApp.requestContact()
                .then(({phone}) => {
                    localStorage.setItem('phone', phone);
                    setPhoneNumber(phone);
                    // Добавляем второй элемент
                    setInfoElements(prev => [
                        ...prev,
                        <Typography.Body key="phone">Телефон: {phone}</Typography.Body>
                    ]);
                })
                .catch(error => {
                    console.error("Ошибка запроса контакта:", error);
                    setInfoElements(prev => [
                        ...prev,
                        <Typography.Body key="error" style={{ color: 'red' }}>
                            Ошибка получения телефона
                        </Typography.Body>
                    ]);
                    hasRequested.current = false;
                });
        }
    }, [webApp, user]);

    return (
        <Container>
            <Panel className="panel">
                <Arrival warehouseName="ворота" />
            </Panel>
            <DevBox>
                infoElements
            </DevBox>
        </Container>
    );
}

export default App;