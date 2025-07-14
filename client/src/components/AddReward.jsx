"use client";
import { useState } from "react";
import Button from "./Button.jsx";

export function AddRewardModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");

  const handleSave = () => {
    if (
      name &&
      description &&
      pointsRequired !== "" &&
      !isNaN(Number(pointsRequired)) &&
      brand &&
      category
    ) {
      onSave({
        name,
        description,
        pointsRequired: Number(pointsRequired),
        brand,
        category,
      });

      setName("");
      setDescription("");
      setPointsRequired("");
      setBrand("");
      setCategory("");
      onClose();
    } else {
      alert(
        "Please fill in all required fields (Name, Description, Points Required, Brand, Category).",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add New Reward</h2>
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
              htmlFor="reward-name"
              className="text-right text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="reward-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reward name"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="brand"
              className="text-right text-sm font-medium text-gray-700"
            >
              Brand
            </label>
            <input
              id="brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter brand name"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="description"
              className="text-right text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reward description"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="points-required"
              className="text-right text-sm font-medium text-gray-700"
            >
              Points
            </label>
            <input
              id="points-required"
              type="number"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter points required"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="category"
              className="text-right text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="col-span-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              <option value="Snack">Snack</option>
              <option value="Drinks">Drinks</option>
              <option value="School Supply">School Supply</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Reward
          </Button>
        </div>
      </div>
    </div>
  );
}
