import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "light" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-red text-white hover:bg-red-bright",
  secondary: "bg-navy text-white hover:bg-navy-light",
  light: "bg-white text-navy hover:bg-off-white",
  ghost: "bg-transparent text-navy ring-1 ring-navy/20 hover:bg-white"
};

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
