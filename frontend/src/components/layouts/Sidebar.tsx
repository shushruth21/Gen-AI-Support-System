"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  AlertCircle,
  Inbox,
  Briefcase,
  CheckSquare,
  BookOpen,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Issues", href: "/issues", icon: AlertCircle },
  { name: "Assigned", href: "/assigned", icon: Inbox },
  { name: "Worked", href: "/worked", icon: Briefcase },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-scrollbar flex h-full w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
        <span className="text-lg font-bold tracking-tight text-indigo-900">
          Gen AI <span className="text-indigo-500">Support</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href) || false;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
