"use client";

import { usePathname } from "next/navigation";
import { Home, UserX, Calendar } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard-agent",
      active: pathname === "/dashboard-agent",
    },
    {
      name: "Absences",
      icon: UserX,
      path: "/dashboard-agent/absences",
      active: pathname === "/dashboard-agent/absences",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                item.active
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
