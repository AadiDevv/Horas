"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell } from "lucide-react";

interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      setIsAuthenticated(Boolean(token));

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          console.error("Erreur lors du parsing des données utilisateur:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUserData();

    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
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

            {(user?.role === "manager" || user?.role === "admin") && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu size={24} />
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-6">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.prenom.charAt(0).toUpperCase()}
              {user.nom.charAt(0).toUpperCase()}
            </div>
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
