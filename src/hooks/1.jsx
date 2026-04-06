// hooks/useMaxWebApp.js
import { useState, useEffect } from 'react';

export const useMaxWebApp = () => {
  const [webApp, setWebApp] = useState(null);
  const [initData, setInitData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Проверяем, что объект WebApp доступен
    if (window && window.WebApp) {
      setWebApp(window.WebApp);
      setInitData(window.WebApp.initDataUnsafe); // Данные о запуске и пользователе
      setUser(window.WebApp.initDataUnsafe?.user); // Информация о пользователе
    } else {
      console.warn('MAX WebApp не найден. Убедитесь, что скрипт подключен.');
    }
  }, []);

  return { webApp, initData, user };
};