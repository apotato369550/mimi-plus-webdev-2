import { useState, useEffect } from "react";
import Button from "./Button.jsx";

export default function ProcessPending({ open, onClose, onApprove }) {
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
  }, [open]);

  const fetchPendingRedemptions = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/pending-redemptions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingRedemptions(data.pendingRedemptions || []);
      } else {
        setPendingRedemptions([]);
      }
    } catch (error) {
      setPendingRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(pendingRedemptions.map((item) => item.id));
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
      const response = await fetch("/api/admin/process-pending", {
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
          errorData.message || "Failed to process pending redemptions",
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
      const response = await fetch("/api/admin/process-pending", {
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
          errorData.message || "Failed to process pending redemptions",
        );
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h4 className="font-bold text-gray-900 mb-2">
          Process Pending Redemptions
        </h4>
        <p className="text-gray-600 mb-4">
          Select redemptions to approve or deny below.
        </p>

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {pendingRedemptions.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No pending redemptions.
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
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Points</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingRedemptions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(tx.id)}
                        onChange={(e) =>
                          handleSelectItem(tx.id, e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">{tx.id}</td>
                    <td className="px-4 py-2">{tx.date}</td>
                    <td className="px-4 py-2">{tx.name}</td>
                    <td className="px-4 py-2">{tx.description}</td>
                    <td className="px-4 py-2">{tx.points}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {tx.status}
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

        <div className="flex gap-4 justify-between mt-4">
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
      </div>
    </div>
  );
}
