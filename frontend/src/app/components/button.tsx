'use client';

import { useRouter } from 'next/navigation';

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string; // <- optionnel
};

export default function Button({ children, onClick, className }: ButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/login')}
      className={`
        bg-[#333333] text-white px-6 py-3 rounded-lg
        hover:bg-[#444444] transition duration-200 shadow
        font-semibold
        ${className || ''}
      `}
    >
      {children}
    </button>
  );
}
