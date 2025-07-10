export default function Button({ variant = "primary", children }) {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 py-[10px] text-white w-32",
    secondary: "bg-white hover:bg-gray-50 py-[10px] border border-gray-300 text-gray-700 w-32",
    borderless: "bg-transparent hover:bg-gray-100 py-[10px] text-gray-700 w-32",
    card: "bg-primary-600 hover:bg-primary-700 py-[10px] text-white w-full",
  };

  return (
    <button 
      className={`rounded-lg text-center transition-colors duration-200 whitespace-nowrap w-fit py-2.5 px-4 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}