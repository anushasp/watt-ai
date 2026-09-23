import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routeConfig } from '@/app/router';

/** Mounts the real route tree at a given URL, so tests exercise actual navigation. */
export function renderApp(initialPath = '/') {
  const router = createMemoryRouter(routeConfig, { initialEntries: [initialPath] });
  const utils = render(<RouterProvider router={router} />);
  return { ...utils, router };
}

export function currentPath(router: ReturnType<typeof createMemoryRouter>): string {
  return router.state.location.pathname + router.state.location.search;
}
