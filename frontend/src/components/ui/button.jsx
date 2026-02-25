import React from "react";
import { cn } from "../../lib/utils";

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "text-slate-700 hover:bg-slate-100",
  link: "text-indigo-600 underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export function buttonVariants({ variant = "default", size = "default", className } = {}) {
  return cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.default, className);
}

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
