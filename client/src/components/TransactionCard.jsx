import { ArrowDownLeft, ArrowUpRight, Gift } from "lucide-react";

export default function TransactionCard({ transaction }) {
  if (!transaction) return null;

  const getTransactionIcon = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType === 'redeemed' || lowerType === 'redeem') {
      return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
    } else if (lowerType === 'purchase' || lowerType === 'earned') {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (lowerType === 'reward') {
      return <Gift className="h-4 w-4 text-blue-600" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
  };

  const getTransactionColor = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType === 'redeemed' || lowerType === 'redeem') {
      return "text-red-600";
    } else if (lowerType === 'purchase' || lowerType === 'earned') {
      return "text-green-600";
    } else if (lowerType === 'reward') {
      return "text-blue-600";
    }
    return "text-gray-600";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex justify-between border border-gray-300 px-4 py-3 gap-4 rounded-[8px]">
      <div className="flex gap-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          transaction.type.toLowerCase() === 'redeemed' || transaction.type.toLowerCase() === 'redeem'
            ? 'bg-red-100'
            : 'bg-emerald-100'
        }`}>
          {getTransactionIcon(transaction.type)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-gray-900 text-md font-semibold">
              {transaction.type.toLowerCase() === 'redeemed' || transaction.type.toLowerCase() === 'redeem'
                ? `Redeemed: ${transaction.description.split(' - ')[0]}`
                : transaction.description}
            </p>
            {transaction.status && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {transaction.status}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
          {(transaction.type.toLowerCase() === 'redeemed' || transaction.type.toLowerCase() === 'redeem') ? '-' : '+'}{transaction.amount}
        </p>
        <p className="text-gray-500 text-sm">Points</p>
      </div>
    </div>
  );
}
