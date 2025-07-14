import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header.jsx";
import Content from "../components/Content.jsx";
import MetricCard from "../components/MetricCard.jsx";
import HomepageRewardCard from "../components/HomepageRewardCard.jsx";
import Button from "../components/Button.jsx";
import { QrCode, Gift, Clock } from "lucide-react";
import RecentTransactions from "../components/RecentTransactions.jsx";

export default function HomePage() {
  const [points, setPoints] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check user role and redirect if admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === 'admin') {
      window.location.href = "/admindashboard";
      return;
    }

    const fetchHomeData = async () => {
      try {
        console.log("Fetching home data...");
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);

        if (!token) {
          console.log("No token found, redirecting to login");
          setError("No authentication token found. Please log in.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return;
        }

        const res = await axios.get("/api/home", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Home data received:", res.data);

        const {
          pointsAvailable,
          totalEarnedLifetime,
          totalRedeemedLifetime,
          quickRewards,
          lastMonthMetrics,
        } = res.data;

        setPoints({
          pointsAvailable,
          totalEarnedLifetime,
          totalRedeemedLifetime,
          lastMonthMetrics,
        });
        setRewards(quickRewards || []);
        setError("");
      } catch (error) {
        console.error("Failed to fetch home data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Authentication failed, redirecting to login");
          setError("Authentication failed. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else if (error.code === "ERR_NETWORK") {
          setError(
            "Cannot connect to server. Please check if the server is running.",
          );
        } else {
          setError(`Error: ${error.response?.data?.message || error.message}`);
        }
      }
    };
    fetchHomeData();
  }, []);

  const handleRedeem = async (rewardID) => {
    setMessage("");
    try {
      const res = await axios.post(
        "/api/home/redeem",
        { rewardID },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setMessage(res.data.message);

      // Refresh home data to update points
      const homeRes = await axios.get("/api/home", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const {
        pointsAvailable,
        totalEarnedLifetime,
        totalRedeemedLifetime,
        quickRewards,
        lastMonthMetrics,
      } = homeRes.data;
      setPoints({
        pointsAvailable,
        totalEarnedLifetime,
        totalRedeemedLifetime,
        lastMonthMetrics,
      });
      setRewards(quickRewards || []);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Redeem failed");
    }
  };

  return (
    <>
      <Header />
      <Content>
        <div className="flex justify-between items-center w-full py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Welcome Back Jose</h3>
            <p className="text-gray-600">Track and manage your Mimi+ points!</p>
          </div>
          <Button>
            <div className="flex gap-2">
              <QrCode /> QR
            </div>
          </Button>
        </div>

        {message && (
          <div className="my-2 text-center text-sm text-red-600">{message}</div>
        )}

        {error && (
          <div className="my-2 text-center text-sm text-red-600">{error}</div>
        )}

        {points && (
          <div className="flex justify-between gap-2 w-full">
            <div className="flex flex-col gap-8 w-full">
              <div className="flex gap-2">
                <MetricCard
                  header="Available Points"
                  digit={points.pointsAvailable}
                />
                <MetricCard
                  header="Total Earned"
                  digit={points.totalEarnedLifetime}
                />
                <MetricCard
                  header="Total Redeemed"
                  digit={points.totalRedeemedLifetime}
                />
              </div>

              <div className="flex flex-col gap-6">
                <h3 className="font-semibold">Quick Rewards</h3>
                {rewards.length === 0 ? (
                  <div className="flex justify-center items-center h-32 border border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Gift className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        No quick rewards available.
                      </p>
                      <p className="text-gray-500 text-sm">
                        Check back later for new rewards!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pb-5">
                    {rewards.map((reward) => (
                      <HomepageRewardCard
                        key={reward.rewardID}
                        icon={<Gift />}
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
            </div>

            <div className="h-fit flex rounded-[8px] flex-col border border-gray-300 w-[402px] px-6 py-5 gap-6">
              <div className="flex items-center gap-3">
                <Clock />
                <p className="text-lg font-semibold">Recent Transactions</p>
              </div>
              <RecentTransactions />
            </div>
          </div>
        )}
      </Content>
    </>
  );
}
