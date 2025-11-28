import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "rounded-lg text-center transition-all duration-200 whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 hover:bg-primary-700 text-white shadow-sm hover:shadow-md",
        secondary: "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm",
        outline: "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
        borderless: "bg-transparent hover:bg-gray-100 text-gray-700",
        card: "bg-primary-500 hover:bg-primary-700 text-white w-full shadow-sm hover:shadow-md",
        destroy: "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export default function Button({
  variant,
  size,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
