export default function MetricCard({ header, digit }) {
  return (
    <div className="flex bg-white flex-col px-4 py-3 border border-gray-300 rounded-[8px] shadow-xs h-fit w-full gap-2">
      <p className="text-sm font-semibold text-gray-500">{header}</p>
      <div>
        <h2 className="text-lg font-black text-gray-900">{digit}</h2>
        {header === "Total Users" ? (
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-400">For all time</p>
          </div>
        ) : header === "Rewards Issued" ||
          header === "Points Issued" ||
          header === "Pending Redemptions" ? (
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-400">This month</p>
          </div>
        ) : header === "Available Points" ||
          header === "Total Earned" ||
          header === "Total Redeemed" ? (
          <div className="flex justify-between items-center">
            <p>All Time</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
