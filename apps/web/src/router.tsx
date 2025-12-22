import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layouts/app-layout';
import { HomePage } from './pages/home';
import { ConfigItemsPage } from './pages/config-items';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'config-items', element: <ConfigItemsPage /> },
    ],
  },
]);
