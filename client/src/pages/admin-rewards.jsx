import { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Pagination from "../components/Pagination.jsx";
import { AddRewardModal } from "../components/AddReward.jsx";
import { DeleteRewardModal } from "../components/DeleteReward.jsx";

export default function RewardsDashboard() {
  const [rewardsData, setRewardsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddReward, setShowAddReward] = useState(false);
  const [showDeleteReward, setShowDeleteReward] = useState(false);

  useEffect(() => {
    // Check user role and redirect if not admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== 'admin') {
      window.location.href = "/login";
      return;
    }

    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/rewards", {
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
    // Filter rewards based on search term
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm]);

  // Pagination logic
  const filteredRewards = rewardsData.filter(reward => {
    const matchesSearch = reward.rewardName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleShowDeleteReward = () => {
    setShowDeleteReward(true);
  };

  const handleCloseDeleteReward = () => {
    setShowDeleteReward(false);
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
        // Refresh the rewards list
        await fetchRewards();
      } else {
        console.error("Server error:", responseData);
        alert(
          `Error deleting reward: ${responseData.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      alert("Error deleting reward. Please check your connection and try again.");
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
      <div className="flex">
        <div className="flex flex-col border-r border-gray-300 h-screen w-full p-6 gap-4">
          <h3 className="font-bold">Rewards Directory</h3>
          <div className="flex flex-col border border-gray-300 rounded-[8px] gap-8 px-6 py-5">
            <div>
              <h4 className="font-bold text-gray-900">All Rewards</h4>
              <p className="text-gray-600">
                A list of all rewards available in the Mimi+ system
              </p>
            </div>
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1 w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search rewards..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-gray-400"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </div>
              <div className="flex w-full md:w-auto gap-2">
                <button 
                  onClick={handleShowAddReward}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-400 flex items-center justify-center space-x-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  <span>Add Reward</span>
                </button>
                <button 
                  onClick={handleShowDeleteReward}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-400 flex items-center justify-center space-x-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  <span>Delete Reward</span>
                </button>
              </div>
            </div>

            <div>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Brand
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Points Required
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRewards.map((reward) => (
                    <tr
                      key={reward.rewardID}
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {reward.rewardName}
                      </th>
                      <td className="px-6 py-4">{reward.category}</td>
                      <td className="px-6 py-4">{reward.brand}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reward.isActive === 'active' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {reward.isActive === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 border border-gray-300 rounded-full text-xs font-medium">
                          {reward.pointsRequired}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-gray-500"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                <p className="text-gray-500">No rewards found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
