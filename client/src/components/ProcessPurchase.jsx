"use client";
import { useState } from "react";
import Button from "./Button.jsx";

export function ProcessPurchasesModal({ isOpen, onClose, onProcess }) {
  const [customerName, setCustomerName] = useState("");
  const [costOfPurchase, setCostOfPurchase] = useState("");
  const [error, setError] = useState(null);

  const handleProcess = () => {
    setError(null);
    const parsedCost = Number(costOfPurchase);

    if (!customerName.trim() || isNaN(parsedCost) || parsedCost <= 0) {
      setError(
        "Please fill in all fields correctly. Cost of Purchase must be a positive number.",
      );
      return;
    }

    onProcess({ customerName, costOfPurchase: parsedCost });
    setCustomerName("");
    setCostOfPurchase("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Add New Purchase Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="customer-name"
              className="text-right text-sm font-medium text-gray-700"
            >
              Customer Name
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter customer's full name"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="cost-of-purchase"
              className="text-right text-sm font-medium text-gray-700"
            >
              Cost of Purchase (₱)
            </label>
            <input
              id="cost-of-purchase"
              type="number"
              value={costOfPurchase}
              onChange={(e) => setCostOfPurchase(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter purchase amount in pesos"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm col-span-4 text-center">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <Button variant="primary" onClick={handleProcess}>Add Purchase</Button>
        </div>
      </div>
    </div>
  );
}
