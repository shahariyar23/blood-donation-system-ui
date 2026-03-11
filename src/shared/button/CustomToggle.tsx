import type { ReactNode } from "react";

interface ToggleIconProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
  icon: ReactNode;  
}

const ToggleIcon = ({ isOpen, onClick, className = "", icon }: ToggleIconProps) => {
  return (
    <button
      onClick={onClick}
      aria-expanded={isOpen}
      className={`
        shrink-0 w-7 h-7 rounded-full center-flex
        text-sm font-black
        transition-all duration-300
        ${isOpen ? "text-primary rotate-90" : "bg-gray-100 text-gray-500"}
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

export default ToggleIcon;