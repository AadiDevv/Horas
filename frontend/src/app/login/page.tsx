"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/constants/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }

  interface LoginResponse {
    data: {
      accessToken: string;
      role: string;
      user: User;
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("email", email);
      console.log("password", password);
      const response = await axios.post<LoginResponse>(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      console.log("response", response);
      if (response.status === 200) {
        const { accessToken, user, role } = response.data.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", role);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        setIsLoggedIn(true);
        setError("");
      }
    } catch (err) {
      setError("Échec de la connexion. Veuillez vérifier vos informations.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const userRole = localStorage.getItem("role");
      let redirectPath = "/home";
      if (userRole === "employe") {
        redirectPath = "/dashboard-agent";
      } else if (userRole === "manager") {
        redirectPath = "/dashboard-manager";
      }
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6f4]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#333333] mb-2">
            Bienvenue sur Horas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous pour continuer
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition duration-200"
          >
            Retour à l'accueil
          </button>
        </div>
        {isLoggedIn ? (
          <p className="mt-4 text-sm text-green-600">
            Connexion réussie ! Redirection...
          </p>
        ) : (
          error && <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <div className="bg-[#F5F5F0] rounded-lg shadow-lg p-8 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#333333] mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border dark:border-gray-600 rounded-lg bg-[#F5F5F0] text-gray-900 dark:text-black placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-grey-500 focus:border-transparent transition duration-200"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#333333] mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border dark:border-gray-600 rounded-lg bg-[#F5F5F0] text-gray-900 dark:text-black placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-grey-500 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition duration-200"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-white bg-[#333333] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/*<p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Vous n'avez pas de compte ?{" "}
          <button
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition duration-200"
            onClick={() => router.push("/signup")}
          >
            Créer un compte
          </button>
        </p>*/}
      </div>
    </div>
  );
}
