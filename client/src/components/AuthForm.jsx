import { useState } from "react";
import axios from "axios";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Button from "./Button.jsx";

export default function AuthForm({ variant = "login" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (variant === "login") {
        const res = await axios.post("/api/", {
          email,
          password,
        });

        const { token, customerID, role } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ customerID, role }));
        
        // Redirect based on user role
        if (role === 'admin') {
          window.location.href = "/admindashboard";
        } else {
          window.location.href = "/";
        }
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        const res = await axios.post("/api/register", {
          name,
          email,
          password,
        });

        alert(res.data.message || "Check your email to verify your account!");
        window.location.href = "/login";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

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

        <div className="flex flex-col gap-1">
          <label className="text-sm">Password*</label>
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
        <Button
          type="submit"
          variant="card"
        >
          {variant === "login"
            ? "Log in"
            : "Sign up"}
        </Button>
      </form>

      {variant === "login" ? (
        <>
          <div className="flex justify-end w-full">
            <p className="text-primary-700 text-xs font-semibold cursor-pointer">
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
