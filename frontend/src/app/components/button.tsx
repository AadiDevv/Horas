"use client";

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export default function Button({ children, onClick, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-[#333333] text-white px-6 py-3 rounded-lg
        hover:bg-[#555555] transition-all duration-200 shadow
        font-semibold cursor-pointer active:scale-95
        ${className || ""}
      `}
    >
      {children}
    </button>
  );
}
