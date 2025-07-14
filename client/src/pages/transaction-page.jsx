import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";
import Content from "../components/Content.jsx";
import TransactionCard from "../components/TransactionCard.jsx";
import Button from "../components/Button.jsx";
import SearchBar from "../components/Search.jsx";
import Pagination from "../components/Pagination.jsx";
import { Receipt } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedType, setSelectedType] = useState("All");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const transactionTypes = ["All", "Completed", "Pending"];

  useEffect(() => {
    // Check user role and redirect if admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === 'admin') {
      window.location.href = "/admindashboard";
      return;
    }

    fetchTransactions();
  }, [selectedType, pagination.page]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const type = selectedType === "All" ? "all" : 
                   selectedType === "Pending" ? "pending" : "completed";

      const url = `/api/transactions?page=${pagination.page}&limit=${pagination.limit}&type=${type}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(res.data.transactions || []);
      setUserPoints(res.data.points || 0);
      setPagination(res.data.pagination || pagination);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
  };

  const handleTypeClick = (type) => {
    setSelectedType(type);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when changing filter
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <>
      <Header />
      <Content>
        <div className="flex justify-between items-center w-full py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Transaction History</h3>
            <p className="text-gray-600">
              View your Mimi+ transaction history and points balance
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your points</p>
            <p className="text-right text-lg font-bold text-primary-600">{userPoints}</p>
          </div>
        </div>

        <div className="flex justify-between w-full">
          <div className="flex gap-4">
            {transactionTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "primary" : "secondary"}
                onClick={() => handleTypeClick(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="flex w-[400px]">
            <SearchBar />
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 text-center">
              {selectedType === "All"
                ? "You haven't made any transactions yet."
                : `You haven't made any ${selectedType.toLowerCase()} yet.`}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col w-full px-6 gap-2 py-5 border border-gray-300 rounded-lg">
              {transactions.map((transaction, index) => (
                <TransactionCard key={index} transaction={transaction} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            )}

            {pagination.totalPages <= 1 && (
              <div className="flex justify-end mt-4">
                <div className="text-sm text-gray-500">
                  Showing {transactions.length} of {pagination.total} transactions
                </div>
              </div>
            )}
          </>
        )}
      </Content>
    </>
  );
}
