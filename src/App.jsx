import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ChangeTimePage } from './pages/ChangeTimePage';
import { DevBox } from './components/DevBox';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { VisitPage } from './pages/VisitPage';
import { DevLogProvider } from './logs/DevLogProvider';
import { MaxUserPhoneProvider } from './user/MaxUserPhoneProvider';

function App() {
    return (
        <DevLogProvider>
            <MaxUserPhoneProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/visit/:id" element={<VisitPage />} />
                        <Route path="/change-time" element={<ChangeTimePage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <DevBox />
            </MaxUserPhoneProvider>
        </DevLogProvider>
    );
}

export default App;
