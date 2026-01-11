"use client";

import Button from "./button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import productImage from "../assets/dashboard-manager.png";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function Hero() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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
  }, []);

  const handleButtonClick = () => {
    if (isAuthenticated && user) {
      if (user.role === "manager" || user.role === "admin") {
        router.push("/dashboard-manager");
      } else if (user.role === "employe") {
        router.push("/dashboard-agent");
      } else {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  };
  return (
    <section className="bg-white min-h-screen flex items-center px-6 py-12 sm:px-16 sm:py-0 font-sans">
      <div className="flex flex-col lg:flex-row items-center lg:justify-between w-full max-w-7xl mx-auto gap-10">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Votre temps, notre priorité.
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl mb-8 max-w-lg">
            Horas vous permet de suivre vos équipes et émarger avec simplicité.
          </p>
          <Button
            onClick={handleButtonClick}
            className="text-white px-6 py-3 rounded-lg shadow-lg transition duration-300 cursor-pointer hover:bg-[#555555]"
          >
            {isAuthenticated ? "Accéder au tableau de bord" : "Commencer"}
          </Button>
        </div>

        <div className="w-full lg:w-1/2">
          <Image
            src={productImage}
            alt="Product"
            className="w-full h-auto rounded-xl shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
}
