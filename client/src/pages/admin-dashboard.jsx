import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import MetricCard from "../components/MetricCard.jsx";
import TopCustomers from "../components/TopCustomers.jsx";
import Button from "../components/Button.jsx";
import ProcessPending from "../components/ProcessPending.jsx";
import { ProcessPurchasesModal } from "../components/ProcessPurchase.jsx";
import { AddRewardModal } from "../components/AddReward.jsx";
import { DeleteRewardModal } from "../components/DeleteReward.jsx";
import { DeleteUserModal } from "../components/DeleteUser.jsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/Dialog";
import { Label } from "../components/Label";
import {
  Settings,
  Calendar,
  Plus,
  Trash2,
  HandCoins,
  Gift,
  Users,
} from "lucide-react";

function AdjustPointsRatioModal({ isOpen, onClose, onSave, currentRatio }) {
  const [ratio, setRatio] = useState(currentRatio || 50);
  useEffect(() => {
    setRatio(currentRatio || 50);
  }, [currentRatio, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(Number(ratio));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Points Ratio</DialogTitle>
          <DialogDescription>
            Set how many pesos are required to earn 1 point.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ratio">Pesos per 1 Point</Label>
              <input
                id="ratio"
                type="number"
                min={1}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={ratio}
                onChange={e => setRatio(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPending, setShowPending] = useState(false);
  const [showProcessPurchases, setShowProcessPurchases] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddReward, setShowAddReward] = useState(false);
  const [showDeleteReward, setShowDeleteReward] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showAdjustPoints, setShowAdjustPoints] = useState(false);
  const [pointsRatio, setPointsRatio] = useState(() => Number(localStorage.getItem("pointsRatio")) || 50);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchTransactions();
    fetchTopCustomers();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const response = await fetch("/api/admin/transactions?limit=10", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        const errorData = await response.json();
        setTransactionsError(errorData.message || 'Failed to fetch transactions');
        // Keep the previous transactions data
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactionsError('Failed to fetch transactions');
      // Keep the previous transactions data
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchTopCustomers = async () => {
    try {
      const response = await fetch("/api/admin/top-customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTopCustomers(data.users);
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePendingApproved = async () => {
    await fetchDashboardData();
    await fetchTransactions();
    await fetchTopCustomers();
  };

  const handleShowPending = () => {
    setShowPending(true);
  };

  const handleClosePending = () => {
    setShowPending(false);
  };

  const handleShowProcessPurchases = () => {
    if (users.length > 0) {
      setSelectedUser(users[0]); // Select first user by default
      setShowProcessPurchases(true);
    } else {
      alert("No users available. Please add users first.");
    }
  };

  const handleCloseProcessPurchases = () => {
    setShowProcessPurchases(false);
    setSelectedUser(null);
  };

  const handleShowAddReward = () => {
    setShowAddReward(true);
  };

  const handleCloseAddReward = () => {
    setShowAddReward(false);
  };

  const handleShowDeleteReward = () => {
    setShowDeleteReward(true);
  };

  const handleCloseDeleteReward = () => {
    setShowDeleteReward(false);
  };

  const handleShowDeleteUser = () => {
    setShowDeleteUser(true);
  };

  const handleCloseDeleteUser = () => {
    setShowDeleteUser(false);
  };

  const handleDeleteReward = async (rewardId) => {
    try {
      console.log("Deleting reward:", rewardId);

      const response = await fetch(`/api/admin/delete-reward/${rewardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Reward deleted successfully:", responseData);
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error deleting reward: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      alert(
        "Error deleting reward. Please check your connection and try again.",
      );
    }
  };

  const handleAddReward = async (rewardData) => {
    try {
      console.log("Sending reward data:", rewardData);

      const response = await fetch("/api/admin/add-reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(rewardData),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Reward added successfully:", responseData);
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error adding reward: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error adding reward:", error);
      alert("Error adding reward. Please check your connection and try again.");
    }
  };

  const handleProcessPurchase = async (purchaseData) => {
    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }

    try {
      console.log("Sending purchase data:", { ...purchaseData, userId: selectedUser.userID });

      const response = await fetch("/api/admin/process-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...purchaseData,
          userId: selectedUser.userID
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Refresh dashboard data after successful purchase processing
        await fetchDashboardData();
        await fetchTransactions();
        await fetchTopCustomers();
        handleCloseProcessPurchases();
        console.log("Purchase processed successfully:", responseData);
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error processing purchase: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      alert(
        "Error processing purchase. Please check your connection and try again.",
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      console.log("Deleting user:", userId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("User deleted successfully:", responseData);
        await fetchDashboardData();
        await fetchTopCustomers();
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error deleting user: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(
        "Error deleting user. Please check your connection and try again.",
      );
    }
  };

  const handleShowAdjustPoints = () => setShowAdjustPoints(true);
  const handleCloseAdjustPoints = () => setShowAdjustPoints(false);
  const handleSaveAdjustPoints = (newRatio) => {
    setPointsRatio(newRatio);
    localStorage.setItem("pointsRatio", newRatio);
    setShowAdjustPoints(false);
    alert(`Points ratio updated: ₱${newRatio} per 1 point`);
  };

  const handleViewUsers = () => {
    window.location.href = "/admin/customers";
  };

  if (loading) {
    return (
      <>
        <Header variant="admin" />
        <div className="flex justify-center items-center h-screen"></div>
      </>
    );
  }

  return (
    <>
      <Header variant="admin" />
      <ProcessPending
        open={showPending}
        onClose={handleClosePending}
        onApprove={handlePendingApproved}
      />
      <ProcessPurchasesModal
        isOpen={showProcessPurchases}
        onClose={handleCloseProcessPurchases}
        onProcess={handleProcessPurchase}
        selectedUser={selectedUser}
      />
      <AddRewardModal
        isOpen={showAddReward}
        onClose={handleCloseAddReward}
        onSave={handleAddReward}
      />
      <DeleteRewardModal
        isOpen={showDeleteReward}
        onClose={handleCloseDeleteReward}
        onDelete={handleDeleteReward}
      />
      <DeleteUserModal
        isOpen={showDeleteUser}
        onClose={handleCloseDeleteUser}
        onDelete={handleDeleteUser}
      />
      <AdjustPointsRatioModal
        isOpen={showAdjustPoints}
        onClose={handleCloseAdjustPoints}
        onSave={handleSaveAdjustPoints}
        currentRatio={pointsRatio}
      />
      <div className="flex w-screen">
        <div className="flex bg-gray-50 flex-col border-r border-gray-300 h-[calc(100vh-65px)] w-full px-4 py-3 gap-4">
          <h3 className="font-bold">Dashboard</h3>
          <div className="flex gap-6 pb-8">
            <MetricCard
              header="Total Users"
              digit={dashboardData?.totalUsers || 0}
            />
            <MetricCard
              header="Rewards Issued"
              digit={dashboardData?.thisMonthActive || 0}
            />
            <MetricCard
              header="Points Issued"
              digit={dashboardData?.thisMonthRedeemed || 0}
            />
            <MetricCard
              header="Pending Redemptions"
              digit={dashboardData?.thisMonthPending || 0}
            />
          </div>
          <div className="flex bg-white flex-col border border-gray-200 rounded-[8px] gap-8 px-6 pt-5 pb-10">
            <div>
              <p className="text-lg font-bold text-gray-900">
                Recent Transactions
              </p>
              <p className="text-sm text-gray-600">
                A list of the recent transactions from Mimi+ users
              </p>
            </div>
            <div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">Loading transactions...</td>
                    </tr>
                  ) : transactionsError ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-red-500">{transactionsError}</td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">No transactions found</td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-200">
                        <td className="px-6 py-4">{transaction.date}</td>
                        <td className="px-6 py-4">{transaction.name}</td>
                        <td className="px-6 py-4">{transaction.type}</td>
                        <td className="px-6 py-4">{transaction.description}</td>
                        <td className="px-6 py-4">{transaction.points}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[380px] p-6 gap-6">
          <div className="flex flex-col p-4 gap-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-lg">Quick Actions</p>
              <Calendar className="text-gray-500" size={16} />
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={handleShowPending}
                disabled={false}
              >
                <div className="flex ml-8 items-center text-sm">
                  <Plus className="mr-4" size={16} />
                  Process Pending
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={handleShowAddReward}
                disabled={false}
              >
                <div className="flex ml-8 items-center text-sm">
                  <Gift className="mr-4" size={16} />
                  Add Reward
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={handleShowDeleteReward}
                disabled={false}
              >
                <div className="flex ml-8 items-center text-sm">
                  <Trash2 className="mr-4" size={16} />
                  Delete Reward
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={handleShowDeleteUser}
                disabled={false}
              >
                <div className="flex ml-8 items-center text-sm">
                  <Trash2 className="mr-4" size={16} />
                  Delete User
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={handleShowAdjustPoints}
                disabled={false}
              >
                <div className="flex ml-8 items-center text-sm">
                  <Settings className="mr-4" size={16} />
                  Adjust Points Ratio
                </div>
              </Button>
            </div>
          </div>
          <div className="flex flex-col p-4 gap-2">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Top Customers</p>
              <Calendar className="text-gray-500" size={16} />
            </div>
            <div className="flex flex-col gap-8">
              {topCustomers.map((user, index) => (
                <TopCustomers
                  key={index}
                  index={index + 1}
                  name={user.name}
                  purchases={user.purchases}
                  points={user.points}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
