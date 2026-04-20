import { Flex, Typography } from '@maxhub/max-ui';

export function LogLine ({ timestamp, label, body }) {
    return (
        <Flex>
            <Typography.Headline variant='small-strong'>{timestamp} - {label}:</Typography.Headline>
            <Typography.Body >{body}</Typography.Body>
        </Flex>
    );
};