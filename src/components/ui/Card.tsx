import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated";
}

export function Card({
  children,
  className,
  padding = "md",
  variant = "default",
}: CardProps) {
  const baseClasses = "rounded-2xl border bg-white";
  
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  const variants = {
    default: "shadow-sm",
    elevated: "shadow-md hover:shadow-lg transition-shadow",
  };

  return (
    <div className={clsx(baseClasses, paddingClasses[padding], variants[variant], className)}>
      {children}
    </div>
  );
}
