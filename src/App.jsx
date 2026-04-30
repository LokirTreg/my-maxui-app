import { Panel, Container, Flex, Button, Typography } from '@maxhub/max-ui';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const [geoStatus, setGeoStatus] = useState('');
    const [geoBlocked, setGeoBlocked] = useState(false);

    const hasRequestedContact = useRef(false);

    const addLog = useCallback((label, body) => {
        setLogs((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date().toLocaleString(),
                label,
                body,
            },
        ]);
    }, []);

    const getApp = useCallback(() => {
        if (webApp) {
            return webApp;
        }

        if (typeof window !== 'undefined' && window.WebApp) {
            return window.WebApp;
        }

        return null;
    }, [webApp]);

    const openExternalBrowser = useCallback(() => {
        const app = getApp();
        const currentUrl = window.location.href;

        if (app?.openLink) {
            app.openLink(currentUrl);
            return;
        }

        window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }, [getApp]);

    const requestUserLocation = useCallback(async () => {
        setGeoBlocked(false);
        setGeoStatus('');

        if (typeof window === 'undefined') {
            return;
        }

        if (!window.isSecureContext) {
            const message =
                'Геолокация работает только через HTTPS. Открой мини-приложение по HTTPS-домену.';

            setGeoStatus(message);
            setGeoBlocked(true);
            addLog('Error', message);
            return;
        }

        if (!navigator.geolocation) {
            const message = 'Геолокация не поддерживается этим WebView';

            setGeoStatus(message);
            setGeoBlocked(true);
            addLog('Error', message);
            return;
        }

        try {
            if (navigator.permissions?.query) {
                const permission = await navigator.permissions.query({
                    name: 'geolocation',
                });

                addLog(
                    'Info',
                    `Статус разрешения геолокации: ${permission.state}`
                );

                if (permission.state === 'denied') {
                    const message =
                        'Доступ к геопозиции уже запрещён. Нужно открыть настройки приложения MAX и разрешить геолокацию.';

                    setGeoStatus(message);
                    setGeoBlocked(true);
                    addLog('Error', message);
                    return;
                }
            }
        } catch (error) {
            console.warn('Не удалось проверить permissions API:', error);
            addLog(
                'Info',
                'Permissions API недоступен, пробуем запросить геопозицию напрямую'
            );
        }

        addLog('Info', 'Запрашиваем геопозицию пользователя');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                const distanceKm = getDistanceFromLatLonInKm(
                    WAREHOUSE_COORDS.lat,
                    WAREHOUSE_COORDS.lon,
                    latitude,
                    longitude
                );

                setGeoStatus(
                    `Геопозиция получена. До склада примерно ${distanceKm.toFixed(
                        1
                    )} км`
                );

                addLog(
                    'Info',
                    `Геопозиция получена: lat=${latitude}, lon=${longitude}, точность=${Math.round(
                        accuracy
                    )} м`
                );

                addLog(
                    'Info',
                    `До склада примерно ${distanceKm.toFixed(1)} км`
                );
            },
            (error) => {
                let message = 'Не удалось получить геопозицию';

                if (error.code === error.PERMISSION_DENIED) {
                    message =
                        'Доступ к геопозиции запрещён или MAX не показал окно разрешения';
                }

                if (error.code === error.POSITION_UNAVAILABLE) {
                    message = 'Геопозиция недоступна на устройстве';
                }

                if (error.code === error.TIMEOUT) {
                    message = 'Истекло время ожидания геопозиции';
                }

                setGeoStatus(message);
                setGeoBlocked(true);

                addLog('Error', `${message}: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, [addLog]);

    useEffect(() => {
        const app = getApp();

        if (!app || hasRequestedContact.current) {
            return;
        }

        hasRequestedContact.current = true;

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
                    console.error(
                        'Ошибка чтения телефона из DeviceStorage:',
                        error
                    );
                    addLog('Error', 'Ошибка чтения телефона из DeviceStorage');
                });
        } else {
            addLog('Info', 'window.WebApp.DeviceStorage недоступен');
        }

        if (typeof app.requestContact !== 'function') {
            addLog('Error', 'Метод requestContact недоступен');
            return;
        }

        app.requestContact()
            .then(async (contact) => {
                const phone = contact?.phone;

                if (!phone) {
                    addLog('Error', 'Телефон не был получен');
                    return;
                }

                addLog('Info', `Телефон: ${phone}`);

                if (!app.DeviceStorage) {
                    return;
                }

                try {
                    await app.DeviceStorage.setItem('phone', phone);
                    addLog('Info', 'Телефон сохранен в DeviceStorage');
                } catch (error) {
                    console.error('Ошибка сохранения телефона:', error);
                    addLog('Error', 'Ошибка сохранения телефона');
                }
            })
            .catch((error) => {
                console.error('Ошибка запроса контакта:', error);
                addLog('Error', 'Ошибка получения телефона');

                hasRequestedContact.current = false;
            });
    }, [addLog, getApp, user]);
    return (
        <Container className="panel">
            <Panel className="panel">
                <Arrival warehouseName="ворота" />

                <Flex direction="column" gap={8}>
                    <Button onClick={requestUserLocation}>
                        Получить геопозицию
                    </Button>

                    {geoStatus && (
                        <Typography>
                            {geoStatus}
                        </Typography>
                    )}

                    {geoBlocked && (
                        <Flex direction="column" gap={8}>
                            <Typography>
                                Если окно разрешения не появляется, проверь:
                                приложение MAX должно иметь доступ к геопозиции
                                в настройках телефона. Если внутри MAX WebView
                                разрешить всё равно нельзя, открой страницу во
                                внешнем браузере или используй запрос геопозиции
                                через чат-бота.
                            </Typography>

                            <Button onClick={openExternalBrowser}>
                                Открыть во внешнем браузере
                            </Button>
                        </Flex>
                    )}
                </Flex>
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