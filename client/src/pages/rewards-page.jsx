import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";
import Content from "../components/Content.jsx";
import RewardCard from "../components/RewardCard.jsx";
import Button from "../components/Button.jsx";
import SearchBar from "../components/Search.jsx";
import { Gift } from "lucide-react";

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [message, setMessage] = useState("");

  const categories = ["All", "Snacks", "Drinks", "School Supplies", "Lifestyle"];

  useEffect(() => {
    // Check user role and redirect if admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === 'admin') {
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

      const category = selectedCategory === "All" ? null : selectedCategory;
      const url = category 
        ? `/api/rewards?category=${encodeURIComponent(category)}`
        : "/api/rewards";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRewards(res.data.rewards || []);
      setUserPoints(res.data.points?.pointsBalance || 0);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
  };

  const handleRedeem = async (rewardID) => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/rewards/redeem",
        { rewardID },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setMessage(res.data.message);
      
      // Refresh rewards data to update points
      await fetchRewards();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Redeem failed");
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Header />
      <Content>
        <div className="flex justify-between items-center w-full py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Rewards Store</h3>
            <p className="text-gray-600">
              Redeem your Mimi+ points for amazing rewards!
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your points</p>
            <p className="text-right text-lg font-bold text-primary-600">{userPoints}</p>
          </div>
        </div>

        {message && (
          <div className="my-2 text-center text-sm text-red-600">{message}</div>
        )}

        <div className="flex justify-between w-full">
          <div className="flex gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "secondary"}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="flex w-[400px]">
            <SearchBar />
          </div>
        </div>

        {rewards.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rewards found for this category.</p>
              <p className="text-gray-500 text-sm">Try selecting a different category or check back later!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 pb-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.rewardID}
                icon={<Gift className="h-8 w-8" />}
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
      </Content>
    </>
  );
}
