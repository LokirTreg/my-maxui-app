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
        if(window.WebApp.initDataUnsafe)
        {
            var user_lat = "";
            var user_lon = "";

            var wh_lat = 54.954315;
            var wh_lon = 35.882343;

            function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2-lat1);  // deg2rad below
            var dLon = deg2rad(lon2-lon1); 
            var a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2)
                ; 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km
            return d;
            }

            function deg2rad(deg) {
            return deg * (Math.PI/180)
            }

            $(function() {

                const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
                };

                function success(pos) {
                const crd = pos.coords;
                
                user_lat = crd.latitude;
                user_lon = crd.longitude;

                var str = "<br>lat:" + crd.latitude + "<br>" + "lon:" + crd.longitude;
                str += "<br>" + getDistanceFromLatLonInKm(wh_lat,wh_lon,user_lat,user_lon);
                
                var str1 = "<br><span class='d_m_text'><span class='d_m_hint'>До склада примерно</span>";
                str1 += Math.round(getDistanceFromLatLonInKm(wh_lat,wh_lon,user_lat,user_lon),1) + " км ";
                str1 += "</b></span>";
                
                    setlogElements(prev => [
                        ...prev,
                        <LogLine timestamp={new Date().toLocaleString()} label='Info' body={`${str1}`}/>
                    ]);
                
                }

                function error(err) {
                    setlogElements(prev => [
                        ...prev,
                        <LogLine timestamp={new Date().toLocaleString()} label='Info' body={`ERROR(${err.code}): ${err.message}`}/>
                    ]);
                }

                navigator.geolocation.getCurrentPosition(success, error, options);


            });

            setlogElements(prev => [
                ...prev,
                <LogLine timestamp={new Date().toLocaleString()} label='Info' body={`${window.WebApp.initDataUnsafe.user.id} ${window.WebApp.initDataUnsafe.user.first_name} подключен`}/>
            ]);  
        }
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
                            <LogLine timestamp={new Date().toLocaleString()} label='Info' body={`Телефон был сохранен ранее:  ${result.value} по ключу ${result.key}` }/>
                        ]);           
                    }
                })
            }
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
        <Container className="panel">
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