import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import Header from "../components/Header.jsx";
import Content from "../components/Content.jsx";
import RewardCard from "../components/RewardCard.jsx";
import Button from "../components/Button.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { Gift } from "lucide-react";

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["All", "Snacks", "Drinks", "School Supply", "Lifestyle"];

  useEffect(() => {
    // Check user role and redirect if admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "admin") {
      window.location.href = "/admindashboard";
      return;
    }

    fetchRewards();
  }, [selectedCategory]);

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Keep the category case exactly as selected
      const category = selectedCategory === "All" ? null : selectedCategory;
      console.log("Fetching rewards with category:", category);
      console.log("Selected category state:", selectedCategory);

      const url = category
        ? `/api/rewards?category=${encodeURIComponent(category)}`
        : "/api/rewards";
      console.log("Request URL:", url);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", res.data);
      console.log("Number of rewards returned:", res.data.rewards?.length || 0);
      if (res.data.rewards?.length > 0) {
        console.log(
          "Categories in response:",
          res.data.rewards.map((r) => r.category),
        );
      }

      setRewards(res.data.rewards || []);
      setUserPoints(res.data.points?.pointsBalance || 0);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      console.error("Error details:", error.response?.data);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load rewards. Please try again.");
      }
    }
  };

  const handleRedeem = async (rewardID) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/rewards/redeem",
        { rewardID },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(res.data.message);

      // Refresh rewards data to update points
      await fetchRewards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Redeem failed");
    }
  };

  const handleCategoryClick = (category) => {
    console.log("Category clicked:", category);
    console.log("Previous selected category:", selectedCategory);
    setSelectedCategory(category);
  };

  return (
    <>
      <Header />
      <div className="flex bg-gray-50 flex-col border-r border-gray-300 h-[calc(100vh-65px)] w-full px-4 py-3 gap-4">
        <div className="flex justify-between items-center w-full py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Rewards Store</h3>
            <p className="text-gray-600">
              Redeem your Mimi+ points for amazing rewards!
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your points</p>
            <p className="text-right text-lg font-bold text-primary-600">
              {userPoints}
            </p>
          </div>
        </div>

        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "primary" : "secondary"
                }
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="flex w-[400px]">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {rewards.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No rewards found for this category.
              </p>
              <p className="text-gray-500 text-sm">
                Try selecting a different category or check back later!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 pb-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.rewardID}
                product={reward.rewardName}
                brand={reward.brand}
                description={reward.description}
                category={reward.category}
                points={reward.pointsRequired}
                rewardID={reward.rewardID}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
