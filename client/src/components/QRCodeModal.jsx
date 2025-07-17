import { useState, useEffect } from "react";
import axios from "axios";

export default function QRCodeModal({ isOpen, onClose }) {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchQRCode();
    }
  }, [isOpen]);

  const fetchQRCode = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching QR code with token:", token);
      const response = await axios.get("/api/auth/qrcode", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("QR code response:", response.data);
      setQrCode(response.data.qrCode);
      setError("");
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setError("Failed to load QR code. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your QR Code</h2>
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
        <div className="flex flex-col items-center justify-center py-6">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : qrCode ? (
            <>
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              <p className="mt-4 text-sm text-gray-600">
                Show this QR code to staff to earn points from your purchase
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 