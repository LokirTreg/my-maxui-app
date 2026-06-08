import { Container } from '@maxhub/max-ui';

export function Layout({ children }) {
    return (
        <Container className="app-shell">
            <main className="page">{children}</main>
        </Container>
    );
}
