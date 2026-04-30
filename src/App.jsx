import { Panel, Container, Flex } from '@maxhub/max-ui';
import { useEffect, useRef, useState } from 'react';

import { useMaxWebApp } from './hooks/1';
import { Arrival } from './pages/Arrival';
import { DevBox } from './elements/DevBox';
import { LogLine } from './elements/LogLine';

const WAREHOUSE_COORDS = {
    lat: 54.954315,
    lon: 35.882343,
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function App() {
    const { webApp, user } = useMaxWebApp();

    const [logs, setLogs] = useState([]);
    const hasRequested = useRef(false);

    const addLog = (label, body) => {
        setLogs((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date().toLocaleString(),
                label,
                body,
            },
        ]);
    };

    useEffect(() => {
        const app =
            webApp ??
            (typeof window !== 'undefined' ? window.WebApp : undefined);

        if (!app || hasRequested.current) {
            return;
        }

        hasRequested.current = true;

        addLog('Info', 'window.WebApp успешно подключен');

        const initUser = app.initDataUnsafe?.user ?? user;

        if (initUser) {
            addLog(
                'Info',
                `${initUser.id ?? ''} ${initUser.first_name ?? ''} подключен`.trim()
            );
        }

        if (app.DeviceStorage) {
            addLog('Info', 'window.WebApp.DeviceStorage подключен');

            app.DeviceStorage.getItem('phone')
                .then((result) => {
                    if (result?.value) {
                        addLog(
                            'Info',
                            `Телефон был сохранен ранее: ${result.value} по ключу ${result.key}`
                        );
                    }
                })
                .catch((error) => {
                    console.error('Ошибка чтения телефона из DeviceStorage:', error);
                    addLog('Error', 'Ошибка чтения телефона из DeviceStorage');
                });
        }

        if (navigator.geolocation) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    const distanceKm = getDistanceFromLatLonInKm(
                        WAREHOUSE_COORDS.lat,
                        WAREHOUSE_COORDS.lon,
                        latitude,
                        longitude
                    );

                    addLog(
                        'Info',
                        `До склада примерно ${distanceKm.toFixed(1)} км`
                    );
                },
                (error) => {
                    addLog(
                        'Error',
                        `Ошибка геолокации: ERROR(${error.code}): ${error.message}`
                    );
                },
                options
            );
        } else {
            addLog('Error', 'Геолокация не поддерживается браузером');
        }

        if (typeof app.requestContact === 'function') {
            app.requestContact()
                .then(async (contact) => {
                    const phone = contact?.phone;

                    if (!phone) {
                        addLog('Error', 'Телефон не был получен');
                        return;
                    }

                    addLog('Info', `Телефон: ${phone}`);

                    if (app.DeviceStorage) {
                        try {
                            await app.DeviceStorage.setItem('phone', phone);
                            addLog('Info', 'Телефон сохранен в DeviceStorage');
                        } catch (error) {
                            console.error('Ошибка сохранения телефона:', error);
                            addLog('Error', 'Ошибка сохранения телефона');
                        }
                    }
                })
                .catch((error) => {
                    console.error('Ошибка запроса контакта:', error);
                    addLog('Error', 'Ошибка получения телефона');

                    hasRequested.current = false;
                });
        } else {
            addLog('Error', 'Метод requestContact недоступен');
        }
    }, [webApp, user]);

    return (
        <Container className="panel">
            <Panel className="panel">
                <Arrival warehouseName="ворота" />
            </Panel>

            <DevBox>
                <Flex direction="column">
                    {logs.map((log) => (
                        <LogLine
                            key={log.id}
                            timestamp={log.timestamp}
                            label={log.label}
                            body={log.body}
                        />
                    ))}
                </Flex>
            </DevBox>
        </Container>
    );
}

export default App;