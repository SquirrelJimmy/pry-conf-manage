import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/admin-layout';
import { DashboardAnalysisPage } from './pages/dashboard-analysis';
import { DashboardWorkplacePage } from './pages/dashboard-workplace';
import { SystemConfigItemsPage } from './pages/system-config-items';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard/analysis" replace /> },
      { path: 'dashboard/analysis', element: <DashboardAnalysisPage /> },
      { path: 'dashboard/workplace', element: <DashboardWorkplacePage /> },
      { path: 'system/config-items', element: <SystemConfigItemsPage /> },
    ],
  },
]);
