import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';
import { useMaxWebApp } from './hooks/1';
import { Arrival } from './pages/Arrival';

function App() {
    const { webApp, user } = useMaxWebApp();
    let t = ""
    if (webApp){
        t += "WebApp есть"
    }
    if (user){
        t += " user есть"
    }
    let oldPhone = localStorage.getItem('phone')
    if(oldPhone){
        
        t += " телефон уже был" + oldPhone
    }
    if (window.WebApp){
        t += " window.WebApp есть"
        window.WebApp.requestContact().then(({phone}) => {
            localStorage.setItem('phone', phone);
            t += " Номер телефона пользователя" + phone
            
        });
    }
    return <Panel className="panel">
                    <Arrival warehouseName="ворота" />
                    <Panel mode="secondary" id="panel">{t}</Panel>
                    </Panel>
}

export default App;
