import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';
import { useMaxWebApp } from './hooks/1';
import { Arrival } from './pages/Arrival';
import { DevBox } from './elements/DevBox';
import { LogLine } from './elements/LogLine';
import { useState, useEffect, useRef } from 'react';

function App() {
    const { webApp, user } = useMaxWebApp();
    const [logElements, setlogElements] = useState([]); // Массив элементов
    const [phoneNumber, setPhoneNumber] = useState("");
    const hasRequested = useRef(false);

    useEffect(() => {
        if (hasRequested.current) return;
        if(window.WebApp.DeviceStorage)
        {
        if(window.WebApp.DeviceStorage)
        {
            setlogElements(prev => [
                ...prev,
                <LogLine timestamp={new Date().toLocaleString()} label='Info' body={'window.WebApp.DeviceStorage подключен'}/>
            ]);  
            window.WebApp.DeviceStorage.getItem('phone').then((result) => {
                if (result){
                    setlogElements(prev => [
                        ...prev,
                        <LogLine timestamp={new Date().toLocaleString()} label='Info' body={`Телефон был сохранен ранее:  {result.value} по ключу {result.key}` }/>
                    ]);           
                }
            })
        }

        if (window.WebApp && !hasRequested.current) {
            hasRequested.current = true;
            
            setlogElements(prev => [
                ...prev,
                <LogLine timestamp={new Date().toLocaleString()} label='Info' body='window.WebApp успешно подключен'/>
            ]);            
            window.WebApp.requestContact()
                .then(({phone}) => {
                    window.WebApp.DeviceStorage.setItem('phone', phone);
                    setPhoneNumber(phone);
                    setlogElements(prev => [
                        ...prev,
                        <LogLine timestamp={new Date().toLocaleString()} label='Info' body={'Телефон: ' + phone}/>
                    ]);
                })
                .catch(error => {
                    console.error("Ошибка запроса контакта:", error);
                    setlogElements(prev => [
                        ...prev,
                        <LogLine timestamp={new Date().toLocaleString()} label='Error' body='Ошибка получения телефона'/>
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
                <Flex direction='column'>
                    {logElements}
                </Flex>
            </DevBox>
        </Container>
    );
}

export default App;