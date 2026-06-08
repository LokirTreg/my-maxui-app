import { Button, Flex } from '@maxhub/max-ui';

import { EmptyState } from './EmptyState';

export function ActionButtons({
    buttons,
    onCallback,
    onInternal,
    pendingAction,
}) {
    if (!buttons.length) {
        return <EmptyState text="Нет доступных действий" />;
    }

    return (
        <Flex className="action-list" direction="column" gap={8}>
            {buttons.map((button, index) => (
                <Button
                    className={`action-button ${button.cssclass || ''}`}
                    disabled={pendingAction !== null}
                    key={`${button.title}-${index}`}
                    onClick={() => {
                        if (button.callback) {
                            onCallback(button.callback, index);
                            return;
                        }

                        if (button.internal) {
                            onInternal(button.internal);
                        }
                    }}
                >
                    {pendingAction === index ? 'Выполняем...' : button.title}
                </Button>
            ))}
        </Flex>
    );
}
