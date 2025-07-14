export default function TopCustomers({ name, purchases, points, index }) {
  return (
    <>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <span className="text-sm font-bold text-gray-500">#{index}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500">{purchases} purchases</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-orange-600">{points}</p>
          <p className="text-xs text-gray-500">points</p>
        </div>
      </div>
    </>
  );
}
