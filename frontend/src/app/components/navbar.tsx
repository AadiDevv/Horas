"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem("token")));
    const handler = () =>
      setIsAuthenticated(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-bold tracking-tight cursor-pointer"
        >
          Horas.
        </h1>

        {isAuthenticated && (
          <>
            <span className="text-lg font-medium">Tableau de bord</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={24} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Navbar de droite */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold">Manijay Gupta</p>
              <p className="text-xs text-gray-500">UI/UX Designer</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full" />
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Connexion
          </button>
        )}
      </div>
    </header>
  );
}
