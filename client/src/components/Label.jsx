export function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
} 