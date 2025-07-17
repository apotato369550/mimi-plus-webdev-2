"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { Label } from "./Label";
import Button from "./Button";

export function ReactivateRewardModal({ isOpen, onClose, onReactivate }) {
  const [selectedReward, setSelectedReward] = useState("");
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    // Fetch only inactive rewards for reactivation
    const fetchRewards = async () => {
      try {
        const response = await fetch("/api/admin/rewards?showInactive=true", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Filter rewards based on status - only show inactive rewards for reactivation
          const inactiveRewards = data.rewards.filter(reward => reward.isActive === 'inactive');
          setRewards(inactiveRewards);
        }
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };

    if (isOpen) {
      fetchRewards();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedReward) {
      onReactivate(selectedReward);
      setSelectedReward("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactivate Reward</DialogTitle>
          <DialogDescription>
            This will reactivate the selected reward. Reactivated rewards will be available for redemption again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reward">Select Reward to Reactivate</Label>
              <select
                id="reward"
                value={selectedReward}
                onChange={(e) => setSelectedReward(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a reward</option>
                {rewards.map((reward) => (
                  <option key={reward.rewardID} value={reward.rewardID}>
                    {reward.rewardName} - {reward.brand}
                  </option>
                ))}
              </select>
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
              disabled={!selectedReward}
            >
              Reactivate Reward
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 