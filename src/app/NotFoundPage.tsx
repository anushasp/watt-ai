import { Link } from 'react-router';
import { Button, Heading, Section, Text } from '@/ds';
import { ROUTES } from './routes';

export function NotFoundPage() {
  return (
    <Section size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', maxWidth: 'var(--max-w-md)' }}>
        <Heading level={1} scale="h2">
          We could not find that page
        </Heading>
        <Text size="medium" muted>
          The link may be out of date. Everything in wattsAI lives on one of five pages.
        </Text>
        <div>
          <Link to={ROUTES.home}>
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
