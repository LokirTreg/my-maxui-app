import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

// Вариант 1: Использование библиотеки qrcode.react
export function RandomQRCodePanel  () {
  const [qrValue, setQrValue] = useState('');

  // Генерация случайного значения для QR-кода
  const generateRandomQRValue = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    return `https://example.com/qr/${randomId}?t=${timestamp}`;
  };

  useEffect(() => {
    setQrValue(generateRandomQRValue());
  }, []);

  const refreshQRCode = () => {
    setQrValue(generateRandomQRValue());
  };

  return (
    <Panel mode="secondary" centeredX centeredY>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        {qrValue && (
          <QRCodeSVG 
            value={qrValue} 
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        )}
      </div>
    </Panel>
  );
};

export function Arrival({warehouseName}) {
    return (
        <Panel mode="primary"  centeredX centeredY>
            <Flex 
                gap={10} 
                direction='column' 
                align="center"
                justify="center"
            >
                <Typography.Display>На склад: {warehouseName}</Typography.Display>
                <Button>Прибыл</Button>
                
                <RandomQRCodePanel/>
            </Flex>
        </Panel>
    )
}