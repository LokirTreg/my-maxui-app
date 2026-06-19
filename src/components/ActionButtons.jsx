import { Button, Flex } from '@maxhub/max-ui';

import { EmptyState } from './EmptyState';

const getActionKind = (button) => {
    if (button.type === 'callback') {
        return 'callback';
    }

    if (button.type === 'route') {
        return 'route';
    }

    return 'unknown';
};

export function ActionButtons({
    buttons,
    onCallback,
    onNavigate,
    pendingAction,
}) {
    if (!buttons.length) {
        return <EmptyState text="Нет доступных действий" />;
    }

    return (
        <Flex className="action-list" direction="column" gap={8}>
            {buttons.map((button, index) => {
                const actionKind = getActionKind(button);

                return (
                    <Button
                        className={`action-button action-button_${actionKind} ${
                            button.cssclass || ''
                        }`}
                        disabled={pendingAction !== null}
                        key={`${button.title}-${index}`}
                        onClick={() => {
                            if (actionKind === 'callback') {
                                onCallback(button.callback || '', index, button);
                                return;
                            }

                            if (actionKind === 'route') {
                                onNavigate(button);
                            }
                        }}
                    >
                        {pendingAction === index ? 'Выполняем...' : button.title}
                    </Button>
                );
            })}
        </Flex>
    );
}
