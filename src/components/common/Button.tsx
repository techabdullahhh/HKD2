import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "md" | "lg" | "xl";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-hkd-pink text-white hover:bg-hkd-pink-dark shadow-card",
  secondary: "bg-hkd-panel text-hkd-cream hover:bg-white/10 border border-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-hkd-green text-white hover:brightness-110",
  ghost: "bg-transparent text-hkd-cream hover:bg-white/10"
};

const sizeClasses: Record<Size, string> = {
  md: "px-3 py-1.5 text-sm rounded-lg",
  lg: "px-4 py-2 text-sm rounded-xl",
  xl: "px-6 py-3 text-base rounded-xl"
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "lg", className = "", children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={`font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
