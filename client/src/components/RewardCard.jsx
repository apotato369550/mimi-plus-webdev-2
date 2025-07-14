import { Cookie } from "lucide-react";
import Button from "./Button.jsx";

export default function RewardCard({
  icon = <Cookie className="h-8 w-8" />,
  product,
  brand,
  description,
  category,
  points,
  rewardID,
  onRedeem,
}) {
  return (
    <div className="flex flex-col px-6 py-5 border border-gray-300 rounded-[8px] shadow-sm h-fit w-[479px]">
      <div className="flex justify-start items-center gap-4 pb-4">
        {icon}
        <div>
          <p className="text-md text-gray-900">{product}</p>
          <p className="text-sm text-gray-600">{brand}</p>
        </div>
      </div>
      <p className="text-gray-600 max-w-[300px] pb-6">
        {description}
      </p>
      <div className="flex justify-between pb-2">
        <p className="text-md">
          <span className="bg-gray-200 px-2 py-0.5 rounded-[8px]">{category}</span>
        </p>
        <div>
          <p className="font-black text-primary-600 text-end">{points}</p>
          <p className="text-gray-500 text-end">points</p>
        </div>
      </div>

      <Button 
        variant="card"
        onClick={() => onRedeem && onRedeem(rewardID)}
      >
        <span className="font-semibold">
          Redeem Now
        </span>
      </Button>
    </div>
  );
}
