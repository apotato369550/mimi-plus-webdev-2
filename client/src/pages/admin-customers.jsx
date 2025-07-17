"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Pagination from "../components/Pagination.jsx";
import SearchBar from "../components/SearchBar.jsx";
import Button from "../components/Button.jsx";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { DeleteUserModal } from "../components/DeleteUser.jsx";
import { ReactivateUserModal } from "../components/ReactivateUser.jsx";

export default function CustomerDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/customers?showInactive=true", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      console.log("Starting user deletion process for ID:", userId);
      console.log("Token:", localStorage.getItem("token"));

      const response = await fetch(`/api/admin/customers/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        console.log("User deactivated successfully:", responseData);
        await fetchUsers();
        setShowDeleteModal(false);
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error deactivating user: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert(
        "Error deactivating user. Please check your connection and try again.",
      );
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      console.log("Starting user reactivation process for ID:", userId);
      console.log("Token:", localStorage.getItem("token"));

      const response = await fetch(`/api/admin/reactivate-customer/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        console.log("User reactivated successfully:", responseData);
        await fetchUsers();
        setShowReactivateModal(false);
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error reactivating user: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error reactivating user:", error);
      alert(
        "Error reactivating user. Please check your connection and try again.",
      );
    }
  };

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleShowReactivateModal = () => {
    setShowReactivateModal(true);
  };

  const handleCloseReactivateModal = () => {
    setShowReactivateModal(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <>
        <Header variant="admin" />
        <div className="flex justify-center items-center h-screen">
          <p>Loading customers...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header variant="admin" />
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteUser}
      />
      <ReactivateUserModal
        isOpen={showReactivateModal}
        onClose={handleCloseReactivateModal}
        onReactivate={handleReactivateUser}
      />
      <div className="flex">
        <div className="flex flex-col h-screen w-full px-4 py-3 gap-4">
          <h3 className="font-bold">Customer Directory</h3>
          <div className="flex flex-col border border-gray-200 rounded-[8px] gap-2 px-6 py-5">
            <div>
              <p className="text-lg font-bold text-gray-900">All Customers</p>
              <p className="text-gray-600">
                A list of all customers in the Mimi+ system
              </p>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex w-full gap-4 items-center">
                <div className="flex-1">
                  <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search customers by name or email"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleShowDeleteModal} variant="destructive">
                    <div className="flex justify-center items-center text-sm">
                      <Trash2 size={16} />
                    </div>
                  </Button>
                  <Button onClick={handleShowReactivateModal} variant="outline">
                    <div className="flex justify-center items-center text-sm">
                      <RefreshCw size={16} />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3">Name</th>
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3">Date Joined</th>
                    <th scope="col" className="px-4 py-3 text-center">Points Balance</th>
                    <th scope="col" className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr
                      key={user.userID}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-3">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(user.dateJoined).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary-100 text-primary-600">
                            {user.pointsBalance} points
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.status === 'active' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            )}

            {totalItems === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No customers found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

