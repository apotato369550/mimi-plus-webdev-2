import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <>
      <div className="flex items-center gap-2 border border-gray-300 rounded-[8px] py-2.5 px-3.5 w-full">
        <Search />
        <p className="text-gray-500">Search</p>
      </div>
    </>
  );
}
