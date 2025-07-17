"use client";
import { useState, useEffect } from "react";
import Button from "./Button.jsx";
import { Search } from "lucide-react";

export function ProcessPurchasesModal({ isOpen, onClose, onProcess }) {
  const [costOfPurchase, setCostOfPurchase] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsToEarn, setPointsToEarn] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      // Reset form when modal closes
      setCostOfPurchase("");
      setSearchTerm("");
      setSelectedUser(null);
      setPointsToEarn(0);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // Calculate points to earn based on cost
    const cost = Number(costOfPurchase);
    if (!isNaN(cost) && cost > 0) {
      setPointsToEarn(Math.floor(cost / 50));
    } else {
      setPointsToEarn(0);
    }
  }, [costOfPurchase]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const activeUsers = data.users.filter(user => user.status === 'active');
        setUsers(activeUsers || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm("");
  };

  const handleProcess = async () => {
    setError(null);
    const parsedCost = Number(costOfPurchase);

    if (!selectedUser) {
      setError("Please select a user.");
      return;
    }

    if (isNaN(parsedCost) || parsedCost <= 0) {
      setError("Please enter a valid purchase amount (must be greater than 0).");
      return;
    }

    setLoading(true);
    try {
      await onProcess({ 
        costOfPurchase: parsedCost,
        userId: selectedUser.userID 
      });
      onClose();
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.message || "Failed to process purchase. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw]">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">
              Add New Purchase Transaction
            </h2>
            {selectedUser && (
              <p className="text-sm text-gray-600 mt-1">
                For {selectedUser.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={loading}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid gap-4 py-4">
          {/* Customer Selection Section */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Search className="h-4 w-4 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customer by name or email"
                  className="w-full px-3 py-2 rounded-md focus:outline-none"
                  disabled={loading}
                />
              </div>
              
              {searchTerm && filteredUsers.length > 0 && !selectedUser && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.userID}
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Points</p>
                    <p className="font-medium">{selectedUser.pointsBalance}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Change Customer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Amount Section */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="cost-of-purchase"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cost of Purchase (₱)
              </label>
              <input
                id="cost-of-purchase"
                type="number"
                value={costOfPurchase}
                onChange={(e) => setCostOfPurchase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter purchase amount"
                required
                disabled={loading || !selectedUser}
              />
            </div>

            {costOfPurchase > 0 && (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-600">Points to Earn</p>
                    <p className="text-lg font-semibold text-blue-700">{pointsToEarn} points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600">New Balance After Purchase</p>
                    <p className="text-lg font-semibold text-blue-700">
                      {selectedUser ? selectedUser.pointsBalance + pointsToEarn : 0} points
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <Button 
            variant="primary" 
            onClick={handleProcess}
            disabled={loading || !selectedUser || !costOfPurchase || costOfPurchase <= 0}
          >
            {loading ? "Processing..." : "Add Purchase"}
          </Button>
        </div>
      </div>
    </div>
  );
}
