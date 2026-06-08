import { Button, Flex } from '@maxhub/max-ui';

export function ErrorMessage({ message, onRetry }) {
    return (
        <Flex className="state state_error" direction="column" gap={10}>
            <p>{message}</p>
            {onRetry && (
                <Button className="secondary-button" onClick={onRetry}>
                    Повторить
                </Button>
            )}
        </Flex>
    );
}
