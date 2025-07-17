"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  ShoppingCart,
  Clock,
  MoreHorizontal,
  Mail,
  Calendar,
  DollarSign,
} from "lucide-react";
import SearchBar from "../components/SearchBar.jsx";
import Button from "../components/Button.jsx";
import Header from "../components/Header.jsx";
import { ProcessPurchasesModal } from "../components/ProcessPurchase.jsx";
import ProcessPending from "../components/ProcessPending.jsx";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

export default function StaffPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrHash = searchParams.get("qrHash");

  // AUTH CHECK: Only allow staff or admin, and require token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !user || (user.role !== "staff" && user.role !== "admin")) {
      // Store QR hash in session storage if present
      if (qrHash) {
        sessionStorage.setItem("pendingQrHash", qrHash);
      }
      window.location.href = "/login";
    }
  }, [qrHash]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const initialSelectionMade = useRef(false);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Helper to get JWT
  const getToken = () => localStorage.getItem("token");
  const authHeader = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // Fetch all users (RESTORED TO REAL API)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/staff/users", {
          headers: authHeader(),
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Handle initial user selection and QR code
  useEffect(() => {
    if (users.length === 0 || initialSelectionMade.current) return;

    // First check for QR hash
    if (qrHash) {
      const matchingUser = users.find(user => user.qrcode === qrHash);
      if (matchingUser) {
        setSelectedUserId(matchingUser.userID);
      }
    } else {
      // If no QR hash, check for userID in URL
      const userID = searchParams.get("userID");
      if (userID && users.some(u => String(u.userID) === String(userID))) {
        setSelectedUserId(userID);
      } else {
        setSelectedUserId(users[0]?.userID);
      }
    }
    
    initialSelectionMade.current = true;
  }, [users, qrHash, searchParams]);

  // Fetch selected user details
  useEffect(() => {
    if (!selectedUserId) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/staff/users/${selectedUserId}`, {
          headers: authHeader(),
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setSelectedUser({
          userID: data.userID,
          name: data.name,
          email: data.email,
          dateJoined: data.dateJoined,
          points: data.pointsBalance,
          transactions: data.transactions || [],
        });
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };
    fetchUser();
  }, [selectedUserId]);

  // Filter users by search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()),
  );

  // Handle purchase submit
  const handleProcessPurchase = async ({ costOfPurchase }) => {
    try {
      console.log("Processing purchase:", { userID: selectedUserId, costOfPurchase });
      
      const res = await fetch("/api/staff/purchase", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          userID: selectedUserId,
          costOfPurchase,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to process purchase");
      }

      // After successful purchase, fetch fresh user data to get updated points and transactions
      const userRes = await fetch(`/api/staff/users/${selectedUserId}`, {
        headers: authHeader(),
      });
      
      if (!userRes.ok) {
        throw new Error("Failed to refresh user data");
      }

      const userData = await userRes.json();
      setSelectedUser({
        userID: userData.userID,
        name: userData.name,
        email: userData.email,
        dateJoined: userData.dateJoined,
        points: userData.pointsBalance,
        transactions: userData.transactions || [],
      });

      // Close the modal after successful purchase
      setShowPurchaseModal(false);

      return { success: true };
    } catch (err) {
      console.error("Failed to process purchase:", err);
      throw err; // Re-throw to be handled by the modal
    }
  };

  // Update URL when user is selected
  const handleUserSelect = (userId) => {
    const selectedUserData = users.find(u => u.userID === userId);
    setSelectedUserId(userId);
    
    // Update URL with QR code if available
    if (selectedUserData?.qrcode) {
      navigate(`?qrHash=${selectedUserData.qrcode}`, { replace: true });
    } else {
      navigate(`?userID=${userId}`, { replace: true });
    }
  };

  const handlePendingApproved = async () => {
    // Refresh user data after approving redemptions
    if (selectedUserId) {
      const res = await fetch(`/api/staff/users/${selectedUserId}`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUser({
          userID: data.userID,
          name: data.name,
          email: data.email,
          dateJoined: data.dateJoined,
          points: data.pointsBalance,
          transactions: data.transactions || [],
        });
      }
    }
  };

  const handleShowPending = () => {
    setShowPendingModal(true);
  };

  const handleClosePending = () => {
    setShowPendingModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header variant="staff" />
      <div className="flex flex-1">
        <aside className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <div className="mb-4">
            <SearchBar
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search users..."
            />
          </div>
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">No users found.</p>
            ) : (
              filteredUsers.map((user) => (
                <Button
                  key={user.userID}
                  onClick={() => handleUserSelect(user.userID)}
                  className={`w-full text-left p-3 rounded-md flex items-center space-x-3 ${
                    selectedUser && selectedUser.userID === user.userID
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  variant="secondary"
                >
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </Button>
              ))
            )}
          </div>
        </aside>
        {/* Main Content - User Details & Actions */}
        <main className="flex-1 p-6 overflow-y-auto">
          {selectedUser ? (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedUser.name}'s Profile
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage user details and transactions
                </p>
              </div>
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={!selectedUser}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Process New Purchase
                  </Button>
                  <Button
                    className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleShowPending}
                    disabled={!selectedUser}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Review Pending
                  </Button>
                </div>
              </div>
              {/* User Info */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">
                  User Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>{selectedUser.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Joined:</span>
                    <span>
                      {selectedUser.dateJoined
                        ? new Date(selectedUser.dateJoined).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Points:</span>
                    <span className="font-bold text-orange-600">
                      {selectedUser.points}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <User className="w-16 h-16 mb-4" />
              <p className="text-lg">No user selected.</p>
            </div>
          )}
        </main>
      </div>
      {/* Purchase Modal */}
      <ProcessPurchasesModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onProcess={handleProcessPurchase}
        selectedUser={selectedUser}
      />
      <ProcessPending
        open={showPendingModal}
        onClose={handleClosePending}
        onApprove={handlePendingApproved}
        selectedUser={selectedUser}
        variant="staff"
      />
    </div>
  );
}
