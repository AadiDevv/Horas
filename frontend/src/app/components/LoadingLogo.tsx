"use client";

import Image from "next/image";
import HorasLogo from "@/app/assets/HorasLogo.svg";

interface LoadingLogoProps {
  size?: number;
  className?: string;
}

export default function LoadingLogo({ size = 48, className = "" }: LoadingLogoProps) {
  return (
    <div className={`animate-spin ${className}`} style={{ width: size, height: size }}>
      <Image
        src={HorasLogo}
        alt="Loading"
        width={size}
        height={size}
        priority
      />
    </div>
  );
}
