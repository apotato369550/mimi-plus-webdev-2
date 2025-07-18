import { useState, useEffect } from "react";
import Button from "./Button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";

export default function ProcessPending({ open, onClose, onApprove, selectedUser, variant = "admin" }) {
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPendingRedemptions();
      setSelectedItems([]);
      setSelectAll(false);
    }
  }, [open, selectedUser]);

  const fetchPendingRedemptions = async () => {
    setLoading(true);
    setMessage("");
    try {
      const endpoint = variant === "admin" 
        ? `/api/admin/pending-redemptions/`
        : `/api/staff/redemptions/${selectedUser.userID}?status=pending`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched pending redemptions:", data);
        setPendingRedemptions(data.pendingRedemptions || []);
      } else {
        console.error("Failed to fetch pending redemptions:", response.status);
        setPendingRedemptions([]);
      }
    } catch (error) {
      console.error("Error fetching redemptions:", error);
      setPendingRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(pendingRedemptions.map((item) => item.redeemID));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };

  const handleApprove = async () => {
    if (selectedItems.length === 0) {
      setMessage("Please select at least one redemption to approve.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const endpoint = variant === "admin"
        ? `/api/admin/process-pending`
        : `/api/staff/redemptions/process`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          redemptionIds: selectedItems,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        // Refresh pending redemptions
        await fetchPendingRedemptions();
        // Call parent callback
        if (onApprove) {
          onApprove();
        }
        setTimeout(() => setMessage(""), 5000);
      } else {
        const errorData = await response.json();
        setMessage(
          errorData.message || "Failed to process redemptions",
        );
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (selectedItems.length === 0) {
      setMessage("Please select at least one redemption to deny.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const endpoint = variant === "admin"
        ? `/api/admin/process-pending`
        : `/api/staff/redemptions/process`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deny",
          redemptionIds: selectedItems,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        // Refresh pending redemptions
        await fetchPendingRedemptions();
        // Call parent callback
        if (onApprove) {
          onApprove();
        }
        setTimeout(() => setMessage(""), 5000);
      } else {
        const errorData = await response.json();
        setMessage(
          errorData.message || "Failed to process redemptions",
        );
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open || (variant === "staff" && !selectedUser)) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {variant === "admin" 
              ? "Process Pending Redemptions"
              : `Process Pending Redemptions for ${selectedUser.name}`}
          </DialogTitle>
          <DialogDescription>
            Select redemptions to approve or deny below.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : pendingRedemptions.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {variant === "admin"
                ? "No pending redemptions."
                : `No pending redemptions for ${selectedUser.name}.`}
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 mb-4">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-2">Redeem ID</th>
                  <th className="px-4 py-2">Date</th>
                  {variant === "admin" && <th className="px-4 py-2">Customer</th>}
                  <th className="px-4 py-2">Reward</th>
                  <th className="px-4 py-2">Points</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingRedemptions.map((redemption) => (
                  <tr key={redemption.redeemID} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(redemption.redeemID)}
                        onChange={(e) =>
                          handleSelectItem(redemption.redeemID, e.target.checked)
                        }
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-gray-900">#{redemption.redeemID}</td>
                    <td className="px-4 py-2">
                      {new Date(redemption.dateRedeemed).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    {variant === "admin" && <td className="px-4 py-2">{redemption.customerName}</td>}
                    <td className="px-4 py-2">{redemption.rewardName}</td>
                    <td className="px-4 py-2">
                      <span className="text-red-600">
                        -{redemption.pointsUsed}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {redemption.redeemStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {message && (
          <div
            className={`text-sm p-3 rounded-md mb-4 ${
              message.includes("successfully") || message.includes("No pending")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <DialogFooter>
          <div className="flex gap-4 justify-between w-full">
            <div className="text-sm text-gray-600">
              {selectedItems.length} of {pendingRedemptions.length} selected
            </div>
            <div className="flex gap-4">
              <Button onClick={onClose} variant="secondary">
                Back
              </Button>
              <Button
                onClick={handleDeny}
                disabled={loading || selectedItems.length === 0}
                variant="secondary"
              >
                {loading ? "Processing..." : "Deny Selected"}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading || selectedItems.length === 0}
              >
                {loading ? "Processing..." : "Approve Selected"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
