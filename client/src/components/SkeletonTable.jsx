import { cn } from "../lib/utils";

export function SkeletonTable({ rows = 5, className }) {
  return (
    <div className={cn("w-full animate-pulse", className)}>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-white">
          <tr>
            <th scope="col" className="px-6 py-3">
              <div className="h-3 bg-gray-200 rounded w-16" />
            </th>
            <th scope="col" className="px-6 py-3">
              <div className="h-3 bg-gray-200 rounded w-20" />
            </th>
            <th scope="col" className="px-6 py-3">
              <div className="h-3 bg-gray-200 rounded w-16" />
            </th>
            <th scope="col" className="px-6 py-3">
              <div className="h-3 bg-gray-200 rounded w-32" />
            </th>
            <th scope="col" className="px-6 py-3">
              <div className="h-3 bg-gray-200 rounded w-12" />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-32" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-40" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
