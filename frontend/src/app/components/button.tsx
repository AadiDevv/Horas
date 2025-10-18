"use client";

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string; // <- optionnel
};

export default function Button({ children, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-[#333333] text-white px-6 py-3 rounded-lg
        hover:bg-[#444444] transition duration-200 shadow
        font-semibold
        ${className || ""}
      `}
    >
      {children}
    </button>
  );
}
