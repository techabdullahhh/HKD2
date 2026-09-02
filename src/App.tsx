import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAdmin, RequireAuth } from "@/components/layout/RouteGuards";
import { LoginPage } from "@/pages/Login";
import { PosPage } from "@/pages/pos/PosPage";
import { EmployeeDashboardPage } from "@/pages/employee/EmployeeDashboard";
import { MySalesPage } from "@/pages/employee/MySales";
import { DashboardPage } from "@/pages/admin/Dashboard";
import { OrdersPage } from "@/pages/admin/Orders";
import { EmployeesPage } from "@/pages/admin/Employees";
import { SessionsPage } from "@/pages/admin/Sessions";
import { MenuPage } from "@/pages/admin/Menu";
import { DealsPage } from "@/pages/admin/Deals";
import { ReportsPage } from "@/pages/admin/Reports";
import { PrinterSettingsPage } from "@/pages/admin/PrinterSettings";
import { GeneralSettingsPage } from "@/pages/admin/GeneralSettings";
import { AuditLogsPage } from "@/pages/admin/AuditLogs";
import { BackupPage } from "@/pages/admin/Backup";
import { InvoicePrintPage } from "@/pages/print/InvoicePrint";

const params = new URLSearchParams(window.location.search);
const isPrintMode = params.get("print") === "invoice";

function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />;
}

export default function App() {
  const { ready, init } = useAuthStore();

  useEffect(() => {
    if (!isPrintMode) init();
  }, [init]);

  if (isPrintMode) {
    const orderId = Number(params.get("orderId"));
    return <InvoicePrintPage orderId={orderId} />;
  }

  if (!ready) {
    return <div className="grid h-screen place-items-center bg-hkd-black text-hkd-cream">Loading…</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/pos" element={<PosPage />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
            <Route path="/employee/sales" element={<MySalesPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/orders" element={<OrdersPage />} />
              <Route path="/admin/employees" element={<EmployeesPage />} />
              <Route path="/admin/sessions" element={<SessionsPage />} />
              <Route path="/admin/menu" element={<MenuPage />} />
              <Route path="/admin/deals" element={<DealsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/printer" element={<PrinterSettingsPage />} />
              <Route path="/admin/settings" element={<GeneralSettingsPage />} />
              <Route path="/admin/audit" element={<AuditLogsPage />} />
              <Route path="/admin/backup" element={<BackupPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </HashRouter>
  );
}
