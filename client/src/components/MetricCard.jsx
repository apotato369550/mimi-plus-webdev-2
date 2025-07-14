export default function RewardCard({ header, digit, arrow, percent }) {
  return (
    <div className="flex flex-col px-6 py-5 border border-gray-300 rounded-[8px] shadow-sm h-fit w-full gap-2">
      <h4 className="font-semibold">{header}</h4>
      <div>
        <h2 className="font-bold">{digit}</h2>
        {arrow && percent !== undefined ? (
          <div className="flex justify-between items-center">
            <p>
              {arrow} {percent}% this month
            </p>
          </div>
        ) : header === "Total Customers" ? (
          <div className="flex justify-between items-center">
            <p>all time</p>
          </div>
        ) : header === "Active Members" || header === "Points Redeemed" || header === "Pending Redemptions" ? (
          <div className="flex justify-between items-center">
            <p>This month</p>
          </div>
        ) : header === "Available Points" || header === "Total Earned" || header === "Total Redeemed" ? (
          <div className="flex justify-between items-center">
            <p>All Time</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
