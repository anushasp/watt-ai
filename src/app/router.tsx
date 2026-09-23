import { createBrowserRouter } from 'react-router';
import { SessionProvider } from '@/state/SessionContext';
import { RootLayout } from './RootLayout';
import { NotFoundPage } from './NotFoundPage';
import { HomePage } from '@/features/home/HomePage';
import { BillAnalysisPage } from '@/features/bill-analysis/BillAnalysisPage';
import { PlansPage } from '@/features/plans/PlansPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CopilotPage } from '@/features/copilot/CopilotPage';
import { DocsPage } from '@/features/docs/DocsPage';
import { ArchitecturePage } from '@/features/docs/ArchitecturePage';
import { DesignSystemPage } from '@/features/design-system/DesignSystemPage';
import { ROUTES } from './routes';

function Shell() {
  return (
    <SessionProvider>
      <RootLayout />
    </SessionProvider>
  );
}

export const routeConfig = [
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.billAnalysis.slice(1), element: <BillAnalysisPage /> },
      { path: ROUTES.plans.slice(1), element: <PlansPage /> },
      { path: ROUTES.dashboard.slice(1), element: <DashboardPage /> },
      { path: ROUTES.copilot.slice(1), element: <CopilotPage /> },
      { path: ROUTES.docs.slice(1), element: <DocsPage /> },
      { path: ROUTES.docsArchitecture.slice(1), element: <ArchitecturePage /> },
      { path: ROUTES.designSystem.slice(1), element: <DesignSystemPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
