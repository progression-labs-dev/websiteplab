import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-salmon text-black hover:bg-salmon-hover hover:-translate-y-px",
  ghost:
    "bg-transparent border-[1.5px] border-[rgba(0,0,0,0.15)] text-black hover:border-black hover:bg-[rgba(0,0,0,0.03)]",
  dark:
    "bg-black text-white hover:bg-[#222] hover:-translate-y-px",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-5 py-2 text-sm",
  md: "px-7 py-3 text-[15px]",
  lg: "px-9 py-4 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-pill transition-all duration-300 ease-out-expo whitespace-nowrap tracking-[-0.01em]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
