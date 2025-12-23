import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AdminLayout } from "./layouts/admin-layout";
import { RequireAuth } from "./auth/require-auth";
import { DashboardAnalysisPage } from "./pages/dashboard-analysis/page";
import { DashboardWorkplacePage } from "./pages/dashboard-workplace/page";
import { LoginPage } from "./pages/login/page";
import { SystemConfigItemsPage } from "./pages/system-config-items/page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard/analysis" replace /> },
      { path: "dashboard/analysis", element: <DashboardAnalysisPage /> },
      { path: "dashboard/workplace", element: <DashboardWorkplacePage /> },
      { path: "system/config-items", element: <SystemConfigItemsPage /> },
    ],
  },
]);
