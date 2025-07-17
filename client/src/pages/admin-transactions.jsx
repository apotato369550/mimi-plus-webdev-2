"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Pagination from "../components/Pagination.jsx";
import SearchBar from "../components/SearchBar.jsx";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        console.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <>
        <Header variant="admin" />
        <div className="flex justify-center items-center h-screen">
          <p>Loading transactions...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header variant="admin" />
      <div className="flex w-screen">
        <div className="flex flex-col bg-gray-50 border-r border-gray-300 h-[calc(100vh-65px)] w-full px-4 py-3 gap-4">
          <h3 className="font-bold">Transactions</h3>
          <div className="flex flex-col border border-gray-200 rounded-[8px] gap-2 px-6 py-5">
            <div>
              <p className="text-lg font-bold text-gray-900">
                All Transactions
              </p>
              <p className="text-gray-600">
                A list of all the Mimi+ transactions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transactions by name, description, or type"
                />
              </div>
            </div>
            <div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 whitespace-nowrap">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {transaction.date}
                      </td>
                      <td className="px-4 py-3">{transaction.name}</td>
                      <td className="px-4 py-3">{transaction.type}</td>
                      <td className="px-4 py-3">{transaction.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            transaction.type.toLowerCase() === 'redeem' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                          }`}>
                            {transaction.type.toLowerCase() === 'redeem' ? '-' : '+'}{Math.abs(transaction.points)} points
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found.</p>
              </div>
            )}
            {filteredTransactions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
