"use client";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
      <p className="text-gray-600 mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
    </div>
  );
}
