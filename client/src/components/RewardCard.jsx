import { Cookie, Coffee, Sparkles, PencilRuler } from "lucide-react";
import Button from "./Button.jsx";

export default function RewardCard({
  product,
  brand,
  description,
  category,
  points,
  rewardID,
  onRedeem,
}) {
  const getIconByCategory = (category) => {
    const lowerCategory = category.toLowerCase();
    switch (lowerCategory) {
      case "snacks":
        return <Cookie className="h-8 w-8" />;
      case "drinks":
        return <Coffee className="h-8 w-8" />;
      case "lifestyle":
        return <Sparkles className="h-8 w-8" />;
      case "school supply":
        return <PencilRuler className="h-8 w-8" />;
      default:
        return <Cookie className="h-8 w-8" />;
    }
  };

  return (
    <div className="flex flex-col bg-white px-6 py-5 border border-gray-300 rounded-[8px] shadow-sm h-[280px] w-[449px]">
      <div className="flex-none flex justify-start items-center gap-4 pb-4">
        {getIconByCategory(category)}
        <div>
          <p className="text-md text-gray-900">{product}</p>
          <p className="text-sm text-gray-600">{brand}</p>
        </div>
      </div>
      <p className="flex-1 text-gray-600 text-sm">{description}</p>
      <div className="flex-none flex justify-between items-center py-4">
        <p className="text-md">
          <span className="bg-gray-200 px-2 py-0.5 rounded-[8px]">
            {category}
          </span>
        </p>
        <div>
          <p className="font-black text-primary-600 text-end">{points}</p>
          <p className="text-gray-500 text-end">points</p>
        </div>
      </div>

      <Button variant="card" onClick={() => onRedeem && onRedeem(rewardID)}>
        <span className="font-semibold">Redeem Now</span>
      </Button>
    </div>
  );
}
