import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 text-[15px] bg-white border border-[rgba(0,0,0,0.15)] rounded-md",
        "placeholder:text-text-tertiary",
        "focus:outline-none focus:border-black focus:ring-1 focus:ring-black",
        "transition-colors duration-200",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-text-primary mb-1.5",
        className
      )}
      {...props}
    />
  );
}

export { Input };
