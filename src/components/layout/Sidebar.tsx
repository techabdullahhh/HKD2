import { NavLink } from "react-router-dom";
import type { Role } from "@shared/types";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const employeeItems: NavItem[] = [
  { to: "/employee/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/pos", label: "POS", icon: "🛒" },
  { to: "/employee/sales", label: "My Sales", icon: "🧾" }
];

const adminItems: NavItem[] = [
  { to: "/pos", label: "POS", icon: "🛒" },
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/orders", label: "Orders", icon: "🧾" },
  { to: "/admin/employees", label: "Employees", icon: "👥" },
  { to: "/admin/sessions", label: "Sessions", icon: "⏱️" },
  { to: "/admin/menu", label: "Menu", icon: "🍕" },
  { to: "/admin/deals", label: "Deals", icon: "🎁" },
  { to: "/admin/reports", label: "Reports", icon: "📈" },
  { to: "/admin/printer", label: "Printer", icon: "🖨️" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
  { to: "/admin/audit", label: "Audit Log", icon: "🔍" },
  { to: "/admin/backup", label: "Backup", icon: "💾" }
];

export function Sidebar({ role }: { role: Role }) {
  const items = role === "admin" ? adminItems : employeeItems;
  return (
    <nav className="flex h-full w-[180px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-white/10 bg-hkd-charcoal p-2">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              isActive ? "bg-hkd-pink text-white" : "text-hkd-cream/80 hover:bg-white/10"
            }`
          }
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
