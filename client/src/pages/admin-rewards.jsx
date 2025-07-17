import { useState, useEffect, useRef } from "react";
import Header from "../components/Header.jsx";
import Pagination from "../components/Pagination.jsx";
import { AddRewardModal } from "../components/AddReward.jsx";
import { DeleteRewardModal } from "../components/DeleteReward.jsx";
import { ReactivateRewardModal } from "../components/ReactivateReward.jsx";
import Button from "../components/Button.jsx";
import { Search, Plus, Trash2, RefreshCw } from "lucide-react";
import SearchBar from "../components/SearchBar.jsx";

export default function RewardsDashboard() {
  const [rewardsData, setRewardsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddReward, setShowAddReward] = useState(false);
  const [showDeleteReward, setShowDeleteReward] = useState(false);
  const [showReactivateReward, setShowReactivateReward] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  useEffect(() => {
    // Check user role and redirect if not admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      window.location.href = "/login";
      return;
    }

    fetchRewards();
  }, []);

  const handleDeleteRewardClick = () => {
    setShowDeleteReward(true);
  };

  const handleReactivateRewardClick = () => {
    setShowReactivateReward(true);
  };

  const handleDeleteReward = async (rewardId) => {
    try {
      console.log("Starting reward deletion process for ID:", rewardId);
      console.log("Token:", localStorage.getItem("token"));

      const response = await fetch(`/api/admin/delete-reward/${rewardId}`, {
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
        console.log("Reward deleted successfully:", responseData);
        // Refresh the rewards list
        await fetchRewards();
        setShowDeleteReward(false); // Close the modal after successful deletion
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

  const handleReactivateReward = async (rewardId) => {
    try {
      console.log("Starting reward reactivation process for ID:", rewardId);
      console.log("Token:", localStorage.getItem("token"));

      const response = await fetch(`/api/admin/reactivate-reward/${rewardId}`, {
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
        console.log("Reward reactivated successfully:", responseData);
        // Refresh the rewards list
        await fetchRewards();
        setShowReactivateReward(false); // Close the modal after successful reactivation
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error reactivating reward: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error reactivating reward:", error);
      alert(
        "Error reactivating reward. Please check your connection and try again.",
      );
    }
  };

  const handleCloseReactivateReward = () => {
    setShowReactivateReward(false);
  };

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/rewards?showInactive=true", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRewardsData(data.rewards || []);
      } else {
        console.error("Failed to fetch rewards");
        setRewardsData([]);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setRewardsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredRewards = rewardsData.filter((reward) => {
    const matchesSearch =
      reward.rewardName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalItems = filteredRewards.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRewards = filteredRewards.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShowAddReward = () => {
    setShowAddReward(true);
  };

  const handleCloseAddReward = () => {
    setShowAddReward(false);
  };

  const handleCloseDeleteReward = () => {
    setShowDeleteReward(false);
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
        // Refresh the rewards list
        await fetchRewards();
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

  if (loading) {
    return (
      <>
        <Header variant="admin" />
        <div className="flex justify-center items-center h-screen">
          <p>Loading rewards...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header variant="admin" />
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
      <ReactivateRewardModal
        isOpen={showReactivateReward}
        onClose={handleCloseReactivateReward}
        onReactivate={handleReactivateReward}
      />
      <div className="flex">
        <div className="flex flex-col h-screen w-full px-4 py-3 gap-4">
          <h3 className="font-bold">Rewards Directory</h3>
          <div className="flex flex-col border border-gray-200 rounded-[8px] gap-2 px-6 py-5">
            <div>
              <p className="text-lg font-bold text-gray-900">All Rewards</p>
              <p className="text-gray-600">
                A list of all rewards available in the Mimi+ system
              </p>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex w-full gap-4 items-center">
                <div className="flex-1">
                  <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search rewards by name, category, or brand"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleShowAddReward}>
                    <div className="flex justify-center items-center text-sm">
                      <Plus className="mr-2" size={16} />
                      Add Reward
                    </div>
                  </Button>
                  <Button onClick={handleDeleteRewardClick} variant="destructive">
                    <div className="flex justify-center items-center text-sm">
                      <Trash2 size={16} />
                    </div>
                  </Button>
                  <Button onClick={handleReactivateRewardClick} variant="outline">
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
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Brand</th>
                    <th scope="col" className="px-4 py-3 text-center">Status</th>
                    <th scope="col" className="px-4 py-3 text-center">Points Required</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRewards.map((reward) => (
                    <tr
                      key={reward.rewardID}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {reward.rewardName}
                      </td>
                      <td className="px-4 py-3">
                        {reward.category}
                      </td>
                      <td className="px-4 py-3">
                        {reward.brand}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${reward.isActive === 'active' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{reward.isActive === 'active' ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-primary-100 text-primary-600">
                            {reward.pointsRequired} points
                          </div>
                        </div>
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
                  No rewards found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
