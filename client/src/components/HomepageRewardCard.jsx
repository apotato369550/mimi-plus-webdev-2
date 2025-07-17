import { Cookie, Coffee, Sparkles, PencilRuler } from "lucide-react";
import Button from "./Button.jsx";

export default function HomepageRewardCard(props) {
  const getIconByCategory = (category) => {
    const lowerCategory = category.toLowerCase();
    switch (lowerCategory) {
      case 'snacks':
        return <Cookie className="h-8 w-8" />;
      case 'drinks':
        return <Coffee className="h-8 w-8" />;
      case 'lifestyle':
        return <Sparkles className="h-8 w-8" />;
      case 'school supply':
        return <PencilRuler className="h-8 w-8" />;
      default:
        return <Cookie className="h-8 w-8" />;
    }
  };

  return (
    <div className="flex flex-col px-6 py-5 border border-gray-300 rounded-lg shadow-sm h-[280px] w-[453px]">
      <div className="flex-none flex justify-start items-center gap-4 pb-4">
        {getIconByCategory(props.category)}
        <div>
          <p className="text-md font-medium text-gray-900">{props.product}</p>
          <p className="text-sm text-gray-600">{props.brand}</p>
        </div>
      </div>
      <p className="flex-1 text-gray-600 text-sm">{props.description}</p>
      <div className="flex-none flex justify-between items-center py-4">
        <p className="text-sm">
          <span className="bg-gray-200 px-2 py-1 rounded-lg text-gray-700">
            {props.category}
          </span>
        </p>
        <div>
          <p className="font-bold text-lg text-primary-600 text-end">
            {props.points}
          </p>
          <p className="text-sm text-gray-500 text-end">points</p>
        </div>
      </div>

      <Button
        variant="card"
        onClick={() => props.onRedeem && props.onRedeem(props.rewardID)}
      >
        <span className="font-semibold">Redeem Now</span>
      </Button>
    </div>
  );
}
