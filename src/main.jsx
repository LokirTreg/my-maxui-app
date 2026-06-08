import './logs/installConsoleCapture';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/dist/styles.css';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <MaxUI className="app">
            <App />
        </MaxUI>
    </StrictMode>
);
