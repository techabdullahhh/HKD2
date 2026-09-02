import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-hkd-black">
      <Header />
      <div className="flex min-h-0 min-w-0 flex-1">
        <Sidebar role={user.role} />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
