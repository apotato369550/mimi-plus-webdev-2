import { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Button from "./Button.jsx";

export default function AuthForm({ variant = "login" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");

  // Check if we're on a reset password page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setIsResetPassword(true);
      setResetToken(token);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isForgotPassword) {
        console.log("Sending forgot password request for:", email);
        const res = await axios.post(
          "/api/auth/forgot-password",
          { email },
          {
            timeout: 10000, // 10 second timeout
          },
        );
        console.log("Forgot password response:", res.data);
        setMessage(
          "✅ Password reset link sent to your email! Check your inbox.",
        );
        setEmail(""); // Clear the email field after success
        // Don't hide the form immediately, let user see the success message
      } else if (isResetPassword) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        const res = await axios.post(`/api/auth/reset-password/${resetToken}`, {
          password,
        });
        setMessage("✅ Password reset successful! You can now login.");
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (variant === "register") {
        const res = await axios.post("/api/auth/register", {
          name,
          email,
          password,
        });
        setMessage(
          "✅ Registration successful! Check your email to verify your account.",
        );
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        // Login
        const res = await axios.post("/api/auth/login", {
          email,
          password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            userID: res.data.userID,
            role: res.data.role,
            name: res.data.name,
            email: res.data.email,
            createdAt: res.data.createdAt,
            points: res.data.points
          }),
        );

        // Check for stored QR hash
        const pendingQrHash = sessionStorage.getItem("pendingQrHash");
        if (pendingQrHash && res.data.role === "staff") {
          // Clear the stored hash
          sessionStorage.removeItem("pendingQrHash");
          // Redirect to staff page with QR hash
          window.location.href = `/staff?qrHash=${pendingQrHash}`;
        } else {
          // Normal redirect
          window.location.href =
            res.data.role === "admin" ? "/admin/dashboard" : 
            res.data.role === "staff" ? "/staff" : "/";
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 403 && error.response?.data?.message?.includes("inactive")) {
        setError("Your account is inactive. Please contact support for assistance.");
      } else {
        setError(
          error.response?.data?.message ||
            "An error occurred. Please try again.",
        );
      }
    }
  };

  if (isForgotPassword) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-4 w-[360px]">
        <AiOutlineShoppingCart className="h-12 w-12" />
        <h3 className="font-semibold text-center">Forgot Password</h3>
        <p className="text-gray-600 text-center">
          Enter your email to receive a password reset link
        </p>

        <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Email*</label>
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          {!message ? (
            <Button type="submit" variant="card">
              Send Reset Link
            </Button>
          ) : (
            <Button
              type="button"
              variant="card"
              onClick={() => setIsForgotPassword(false)}
            >
              Back to Login
            </Button>
          )}
        </form>

        {!message && (
          <p className="text-xs text-gray-500">
            Remember your password?{" "}
            <span
              className="text-primary-700 underline cursor-pointer"
              onClick={() => setIsForgotPassword(false)}
            >
              Log in
            </span>
          </p>
        )}
      </div>
    );
  }

  if (isResetPassword) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-4 w-[360px]">
        <AiOutlineShoppingCart className="h-12 w-12" />
        <h3 className="font-semibold text-center">Reset Password</h3>
        <p className="text-gray-600 text-center">Enter your new password</p>

        <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm">New Password*</label>
            <input
              type="password"
              placeholder="New password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">Confirm New Password*</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <Button type="submit" variant="card">
            Reset Password
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-4 w-[360px]">
      <AiOutlineShoppingCart className="h-12 w-12" />

      <h3 className="font-semibold text-center">
        {variant === "login" ? "Login to your account" : "Create an account"}
      </h3>
      <p className="text-gray-600 text-center">
        {variant === "login"
          ? "Welcome back! Please enter your details"
          : "Start your Mimi+ account!"}
      </p>

      {/* 📝 AUTH FORM */}
      <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
        {variant === "register" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm">Name*</label>
            <input
              type="text"
              placeholder="Full name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {variant === "register" && (
          <div className="flex flex-col gap-[1px]">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Confirm Password*</label>
              <input
                type="password"
                placeholder="Confirm password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-gray-400">
              Must be at least 8 characters
            </p>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="card">
          {variant === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>

      {variant === "login" ? (
        <>
          <div className="flex justify-end w-full">
            <p
              className="text-primary-700 text-xs font-semibold cursor-pointer"
              onClick={() => setIsForgotPassword(true)}
            >
              Forgot password?
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary-700 underline">
              Sign up
            </a>
          </p>
        </>
      ) : (
        <p className="text-xs text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-primary-700 underline">
            Log in
          </a>
        </p>
      )}
    </div>
  );
}
