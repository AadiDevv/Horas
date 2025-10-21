"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RoleProtectionProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleProtection({
  children,
  allowedRoles,
  redirectTo = "/unauthorized",
}: RoleProtectionProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const user: User = JSON.parse(userStr);
      if (allowedRoles.includes(user.role)) {
        setIsAuthorized(true);
      } else {
        router.push(redirectTo);
      }
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router, allowedRoles, redirectTo]);
  return isAuthorized ? <>{children}</> : null;
}
