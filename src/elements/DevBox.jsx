import { useState, useEffect } from 'react';
import { Panel, Container, Typography, Button } from '@maxhub/max-ui';
import './DevBox.css'; 

export function DevBox ({ children, defaultExpanded = true, visibility = true }) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const savedState = localStorage.getItem('floatingPanelExpanded');
        if (savedState !== null) {
            setIsExpanded(savedState === 'true');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('floatingPanelExpanded', isExpanded);
    }, [isExpanded]);

    if (!isVisible || !visibility) return null;

    return (
        <Panel className={`floating-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <Container className="floating-panel-header">
                <Typography.Title className="panel-title">
                    <Button 
                        className="toggle-button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? 'Свернуть' : 'Развернуть'}
                    >
                        {isExpanded ? '▼ Логи' : '▲ Логи'}
                    </Button>
                </Typography.Title>
            </Container>
            {children}
        </Panel>
    );
};