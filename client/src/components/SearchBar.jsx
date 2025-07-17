import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search" }) {
  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-[8px] py-2.5 px-3.5 w-full">
      <Search />
      <input
        className="text-gray-700 flex-1 outline-none bg-transparent"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
