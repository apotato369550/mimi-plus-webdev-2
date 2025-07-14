export default function Button({ variant = "primary", size = "default", children, onClick, disabled = false, ...props }) {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white",
    secondary: "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700",
    outline: "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    borderless: "bg-transparent hover:bg-gray-100 text-gray-700",
    card: "bg-primary-600 hover:bg-primary-700 text-white w-full",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  const baseClasses = "rounded-lg text-center transition-colors duration-200 whitespace-nowrap font-medium";
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.default;
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

