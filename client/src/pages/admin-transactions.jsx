"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import Header from "../components/Header.jsx";
import Pagination from "../components/Pagination.jsx";

export default function AdminTransactionsPage() {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const dropdownRefs = useRef({});

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

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId !== null) {
        const currentDropdownRef = dropdownRefs.current[openDropdownId];
        if (currentDropdownRef && !currentDropdownRef.contains(event.target)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="flex">
        <div className="flex flex-col border-r border-gray-300 h-screen w-full p-6 gap-4">
          <h3 className="font-bold">Transactions</h3>
          <div className="flex flex-col border border-gray-300 rounded-[8px] gap-8 px-6 py-5">
            <div>
              <h4 className="font-bold text-gray-900">All Transactions</h4>
              <p className="text-gray-600">A list of all the Mimi+ transactions</p>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="search"
                  placeholder="Search transactions by name, description, or type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Points
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {transaction.id}
                      </th>
                      <td className="px-6 py-4">{transaction.date}</td>
                      <td className="px-6 py-4">{transaction.name}</td>
                      <td className="px-6 py-4">{transaction.type}</td>
                      <td className="px-6 py-4">{transaction.description}</td>
                      <td className="px-6 py-4">{transaction.points}</td>
                      <td className="px-6 py-4">
                        <div
                          className="relative inline-block text-left"
                          ref={(el) =>
                            (dropdownRefs.current[transaction.id] = el)
                          }
                        >
                          <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => toggleDropdown(transaction.id)}
                            aria-expanded={
                              openDropdownId === transaction.id
                            }
                            aria-haspopup="menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </button>
                          {openDropdownId === transaction.id && (
                            <div className="absolute z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white p-1 shadow-lg right-0">
                              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                Edit Transaction
                              </div>
                              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                Delete Transaction
                              </div>
                            </div>
                          )}
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
