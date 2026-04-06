import { Panel, Grid, Container, Flex, Avatar, Typography, Button } from '@maxhub/max-ui';
import { useMaxWebApp } from './hooks/1';

function App() {

  const { webApp, user } = useMaxWebApp();
  console.log(webApp, user)
  return (
      <Panel mode="secondary" className="panel">
          <Grid gap={12} cols={1}>
              <Container className="me">
                  <Flex direction="column" align="center">
                      <Avatar.Container size={72} form="squircle" className="me__avatar">
                          <Avatar.Image src="https://sun9-21.userapi.com/1N-rJz6-7hoTDW7MhpWe19e_R_TdGV6Wu5ZC0A/67o6-apnAks.jpg" />
                      </Avatar.Container>

                      <Typography.Title>Иван Иванов</Typography.Title>
                  </Flex>
              </Container>
              <Container className="me">
                  <Button appearance="themed" mode="primary" onClick={() => {}} size="medium">
                    Button
                  </Button>
                  <Button appearance="themed" mode="primary" onClick={() => {}} size="medium">
                    Button
                  </Button>
              </Container>
          </Grid>
      </Panel>)
}

export default App;
