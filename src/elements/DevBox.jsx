import { useState, useEffect } from 'react';
import './DevBox.css'; // Стили ниже

export function DevBox ({ children, defaultExpanded = true, visibility = true }) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isVisible, setIsVisible] = useState(true);

    // Сохраняем состояние в localStorage
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
        <div className={`floating-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="floating-panel-header">
                <div className="panel-title">
                    <button 
                        className="toggle-button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? 'Свернуть' : 'Развернуть'}
                    >
                        {isExpanded ? '▼ Логи' : '▲ Логи'}
                    </button>
                </div>
                <div className="panel-controls">
                    
                    <button 
                        className="close-button"
                        onClick={() => setIsVisible(false)}
                        title="Закрыть"
                    >
                        ✕
                    </button>
                </div>
            </div>
            
            {isExpanded && (
                <div className="floating-panel-content">
                    {children}
                </div>
            )}
        </div>
    );
};