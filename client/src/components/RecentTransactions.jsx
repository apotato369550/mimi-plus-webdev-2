import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowDownLeft } from "lucide-react";

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.transactions || []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (transactions.length === 0) {
    return (
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center gap-3">
          <div className="p-2 bg-emerald-300 rounded-2xl">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <div>
            <p className="text-gray-600">No recent transactions</p>
            <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  // Show multiple recent transactions (limit to 5 for the sidebar)
  const recentTransactions = transactions.slice(0, 5);
  
  return (
    <div className="flex flex-col gap-3">
      {recentTransactions.map((transaction, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex justify-center items-center gap-3">
            <div className={`p-2 rounded-2xl ${
              transaction.type === 'redeemed' ? 'bg-red-300' : 'bg-emerald-300'
            }`}>
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{transaction.description}</p>
              <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
            </div>
          </div>
          <div>
            <p className={`text-sm font-medium ${
              transaction.type === 'redeemed' ? 'text-red-600' : 'text-green-600'
            }`}>
              {transaction.type === 'redeemed' ? '-' : '+'}{transaction.amount} points
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
