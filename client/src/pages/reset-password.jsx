import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";
import Content from "../components/Content.jsx";
import { AiOutlineShoppingCart } from "react-icons/ai";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newPassword || !confirmNewPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`/api/reset-password/${token}`, {
        password: newPassword,
      });
      setSuccess(
        res.data.message ||
          "Password reset successful! Redirecting to login...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header variant="auth" />
      <Content>
        <div className="flex flex-col items-center justify-center gap-5 p-4 w-[360px]">
          <AiOutlineShoppingCart className="h-12 w-12" />
          <h3 className="font-semibold text-center">Reset Password</h3>
          <p className="text-gray-600 text-center">
            Enter your new password below
          </p>

          <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-sm">New Password*</label>
              <input
                type="password"
                placeholder="New password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm">Confirm New Password*</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="form-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-700 text-white w-full py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !!success}
            >
              {loading ? "Setting..." : "Set Password"}
            </button>
          </form>

          <p className="text-xs text-gray-500">
            Remember your password?{" "}
            <a href="/login" className="text-primary-700 underline">
              Log in
            </a>
          </p>
        </div>
      </Content>
    </>
  );
}
