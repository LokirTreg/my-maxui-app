import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';
import { useMaxWebApp } from './hooks/1';
import { Arrival } from './pages/Arrival';
import { DevBox } from './elements/DevBox';
import { useState, useEffect, useRef } from 'react';

function App() {
    const { webApp, user } = useMaxWebApp();
    const [info, setInfo] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const hasRequested = useRef(false);

    useEffect(() => {
        if (hasRequested.current) return;
        
        let t = "";
        
        if (webApp) {
            t += "WebApp есть ";
        }
        if (user) {
            t += "user есть ";
        }
        
        if (window.WebApp && !hasRequested.current) {
            hasRequested.current = true;
            t += "window.WebApp есть ";
            setInfo(t);
            
            window.WebApp.requestContact()
                .then(({phone}) => {
                    localStorage.setItem('phone', phone);
                    setPhoneNumber(phone);
                    setInfo(prev => prev + "<br>Номер телефона пользователя: " + phone);
                })
                .catch(error => {
                    console.error("Ошибка запроса контакта:", error);
                    setInfo(prev => prev + "<br>Ошибка получения телефона");
                    hasRequested.current = false;
                });
        } else {
            setInfo(t);
        }
    }, [webApp, user]);

    return (
        <Container>
            <Panel className="panel">
                <Arrival warehouseName="ворота" />
            </Panel>
            <DevBox>
                <Panel mode="secondary" id="panel">
                    {info}
                    {phoneNumber && <div>Телефон: {phoneNumber}</div>}
                </Panel>
            </DevBox>
        </Container>
    );
}

export default App;