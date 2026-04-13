import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';

export function Arrival({nextName}) {
    return (
         <Panel mode="primary"  centeredX centeredY>
            <Flex 
                gap={10} 
                direction='column' 
                align="center"
                justify="center"
            >
                <Typography.Display>Следующая точка назначения {nextName}</Typography.Display>
            </Flex>
        </Panel>
    )
}