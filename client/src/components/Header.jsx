import { Link, useLocation } from "react-router-dom";
import headerlogo from "../assets/headerlogo.svg";
import headerstafflogo from "../assets/headerstafflogo.svg";
import Button from "./Button.jsx";
import { User } from "lucide-react";

export default function Header({ variant = "default" }) {
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (variant === "default") {
    return (
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-white">
        <div className="flex justify-center items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={headerlogo} alt="logo" />
          </div>
          <nav className="flex gap-5 text-md font-semibold">
            <Link
              to="/"
              className={
                pathname === "/"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
              }
            >
              Home
            </Link>
            <Link
              to="/rewards"
              className={
                pathname === "/rewards"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
              }
            >
              Rewards
            </Link>
            <Link
              to="/transactions"
              className={
                pathname === "/transactions"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
              }
            >
              Transactions
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/account"
            className={
              pathname === "/account"
                ? "flex items-center gap-2 text-gray-700"
                : "flex items-center gap-2 text-gray-400 hover:text-gray-700"
            }
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Logout
          </button>
        </div>
      </header>
    );
  } else if (variant === "auth") {
    return (
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-2">
          <img src={headerlogo} alt="logo" />
        </div>
        <div className="flex items-center gap-3">
          {pathname === "/login" ? (
            <Button variant="borderless" disabled>
              Log in
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="primary">Log in</Button>
            </Link>
          )}

          {pathname === "/signup" ? (
            <Button variant="borderless" disabled>
              Sign up
            </Button>
          ) : (
            <Link to="/signup">
              <Button variant="primary">Sign up</Button>
            </Link>
          )}
        </div>
      </header>
    );
  } else if (variant === "admin") {
    return (
      <header className="flex justify-between items-center py-4 px-6 border-b border-gray-300 bg-white">
        <div className="flex justify-center items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={headerlogo} alt="logo" />
          </div>
          <nav className="flex gap-5 text-md font-semibold">
            <Link
              to="/admin/dashboard"
              className={
                pathname === "/admin/dashboard"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700 transition duration-300"
              }
            >
              Home
            </Link>
            <Link
              to="/admin/customers"
              className={
                pathname === "/admin/customers"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700 transition duration-300"
              }
            >
              Customers
            </Link>
            <Link
              to="/admin/rewards"
              className={
                pathname === "/admin/rewards"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700 transition duration-300"
              }
            >
              Rewards
            </Link>
            <Link
              to="/admin/transactions"
              className={
                pathname === "/admin/transactions"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700 transition duration-300"
              }
            >
              Transactions
            </Link>
          </nav>
        </div>
        <button
          className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
    );
  } else if (variant === "staff") {
    return (
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-2">
          <img src={headerstafflogo} alt="logo" />
        </div>
        <button
          className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
    );
  }
}
