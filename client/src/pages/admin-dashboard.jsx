import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import MetricCard from "../components/MetricCard.jsx";
import TopCustomers from "../components/TopCustomers.jsx";
import Button from "../components/Button.jsx";
import ProcessPending from "../components/ProcessPending.jsx";
import { ProcessPurchasesModal } from "../components/ProcessPurchase.jsx";
import { AddRewardModal } from "../components/AddReward.jsx";
import { DeleteRewardModal } from "../components/DeleteReward.jsx";
import { DeleteCustomerModal } from "../components/DeleteCustomer.jsx";
import { Calendar, Gift, Plus, LucideTrash } from "lucide-react";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPending, setShowPending] = useState(false);
  const [showProcessPurchases, setShowProcessPurchases] = useState(false);
  const [showAddReward, setShowAddReward] = useState(false);
  const [showDeleteReward, setShowDeleteReward] = useState(false);
  const [showDeleteCustomer, setShowDeleteCustomer] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchTransactions();
    fetchTopCustomers();
  }, []);

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
    try {
      const response = await fetch("/api/admin/transactions?limit=5", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
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
        setTopCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching top customers:", error);
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
    setShowProcessPurchases(true);
  };

  const handleCloseProcessPurchases = () => {
    setShowProcessPurchases(false);
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

  const handleShowDeleteCustomer = () => {
    setShowDeleteCustomer(true);
  };

  const handleCloseDeleteCustomer = () => {
    setShowDeleteCustomer(false);
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
    try {
      console.log("Sending purchase data:", purchaseData);

      const response = await fetch("/api/admin/process-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(purchaseData),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Refresh dashboard data after successful purchase processing
        await fetchDashboardData();
        await fetchTransactions();
        await fetchTopCustomers();
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

  const handleDeleteCustomer = async (customerId) => {
    try {
      console.log("Deleting customer:", customerId);
      
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Customer deleted successfully:", responseData);
        // Refresh dashboard data after successful deletion
        await fetchDashboardData();
        await fetchTopCustomers();
      } else {
        console.error("Server error:", responseData);
        alert(`Error deleting customer: ${responseData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Error deleting customer. Please check your connection and try again.");
    }
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
      <DeleteCustomerModal
        isOpen={showDeleteCustomer}
        onClose={handleCloseDeleteCustomer}
        onDelete={handleDeleteCustomer}
      />
      <div className="flex">
        <div className="flex flex-col border-r border-gray-300 h-screen w-full p-6 gap-4">
          <h3 className="font-bold">Dashboard</h3>
          <div className="flex gap-6">
            <MetricCard
              header="Total Customers"
              digit={dashboardData?.totalCustomers || 0}
            />
            <MetricCard
              header="Active Members"
              digit={dashboardData?.thisMonthActive || 0}
            />
            <MetricCard
              header="Points Redeemed"
              digit={dashboardData?.thisMonthRedeemed || 0}
            />
            <MetricCard
              header="Pending Redemptions"
              digit={dashboardData?.thisMonthPending || 0}
            />
          </div>
          <div className="flex flex-col border border-gray-300 rounded-[8px] gap-8 px-6 py-5">
            <div>
              <h4 className="font-bold text-gray-900">Recent Transactions</h4>
              <p className="text-gray-600">
                A list of the recent transactions from Mimi+ users
              </p>
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
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[540px] p-6 gap-6">
          <div className="flex flex-col border border-gray-300 p-6 gap-5">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Quick Actions</h4>
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex flex-col gap-4">
              <Button onClick={handleShowPending} disabled={false}>
                <div className="flex justify-center">
                  <Plus className="mr-4" />
                  Process Pending
                </div>
              </Button>
              <Button onClick={handleShowProcessPurchases} disabled={false}>
                <div className="flex justify-center">
                  <Plus className="mr-4" />
                  Process Purchases
                </div>
              </Button>
              <Button onClick={handleShowAddReward} disabled={false}>
                <div className="flex justify-center">
                  <Plus className="mr-4" />
                  Add Reward
                </div>
              </Button>
              <Button onClick={handleShowDeleteReward} disabled={false}>
                <div className="flex justify-center">
                  <LucideTrash className="mr-4" />
                  Delete Reward
                </div>
              </Button>
              <Button onClick={handleShowDeleteCustomer} disabled={false}>
                <div className="flex justify-center">
                  <LucideTrash className="mr-4" />
                  Delete Customer
                </div>
              </Button>
            </div>
          </div>
          <div className="flex flex-col border border-gray-300 p-6 gap-5">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Top Customers</h4>
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex flex-col gap-4">
              {topCustomers.map((customer, index) => (
                <TopCustomers
                  key={index}
                  index={index + 1}
                  name={customer.name}
                  purchases={customer.purchases}
                  points={customer.points}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
