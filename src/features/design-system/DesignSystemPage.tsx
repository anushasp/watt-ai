import { Link } from 'react-router';
import { Icon, Text } from '@/ds';
import { ROUTES } from '@/app/routes';
import { DocsLayout } from '@/features/docs/DocsLayout';
import { DESIGN_SYSTEM_SECTIONS } from '@/features/docs/docsNav';
import { ALL_TOKEN_NAMES } from './dsTokens';
import { useTokenValues } from './useTokenValues';
import {
  ColorsSection,
  ElevationSection,
  IconsSection,
  OverviewSection,
  RadiusSection,
  SpacingSection,
  TypographySection,
} from './FoundationSections';
import {
  AiComponentsSection,
  ButtonsSection,
  CardsSection,
  FeedbackSection,
  FormControlsSection,
  NavigationSection,
  UsageGuidelinesSection,
} from './ComponentSections';

export function DesignSystemPage() {
  // One read for the whole page. Values come from the live stylesheet, never from this file.
  const values = useTokenValues(ALL_TOKEN_NAMES);

  return (
    <DocsLayout
      title="WattAI Design System"
      intro="The design foundations, reusable components, and interaction patterns that power the WattAI experience."
      sections={DESIGN_SYSTEM_SECTIONS}
    >
      <Text size="small" muted>
        The system exists to keep the product consistent as it grows, accessible by default rather
        than by audit, and scalable without a rewrite — and to keep design and development working
        from the same source rather than from a screenshot.{' '}
        <Link to={ROUTES.docs}>
          The engineering documentation
          <Icon name="ChevronRight" size={16} style={{ verticalAlign: 'middle' }} />
        </Link>{' '}
        covers the architectural reasoning behind it.
      </Text>

      <OverviewSection />
      <ColorsSection values={values} />
      <TypographySection values={values} />
      <SpacingSection values={values} />
      <RadiusSection values={values} />
      <ElevationSection values={values} />
      <IconsSection />
      <ButtonsSection />
      <FormControlsSection />
      <CardsSection />
      <NavigationSection />
      <FeedbackSection />
      <AiComponentsSection />
      <UsageGuidelinesSection />
    </DocsLayout>
  );
}
