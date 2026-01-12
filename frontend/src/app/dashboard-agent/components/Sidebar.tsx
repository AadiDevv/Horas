"use client";

import { usePathname } from "next/navigation";
import { Home, UserX, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import HorasTitleLogo from "@/app/assets/HorasTitleLogo.svg";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
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

  const handleLinkClick = () => {
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full w-[280px] lg:w-64 bg-white border-r border-gray-200 z-50 p-4 sm:p-6 transform transition-transform duration-300 ${
          isOpen ? "flex translate-x-0" : "flex -translate-x-full lg:translate-x-0"
        } ${!isOpen ? "lg:hidden" : ""}`}
      >
        <div className="w-full">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Image
              src={HorasTitleLogo}
              alt="Horas"
              width={76}
              height={24}
              priority
            />
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors cursor-pointer active:scale-95 ${
                    item.active
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} className="sm:hidden" />
                  <Icon size={20} className="hidden sm:block" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
