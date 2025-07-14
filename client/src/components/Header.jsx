import { Link, useLocation } from "react-router-dom";
import headerlogo from "../assets/headerlogo.svg";
import Button from "./Button.jsx";

export default function Header({ variant = "default" }) {
  const location = useLocation();
  const pathname = location.pathname;

  if (variant === "default") {
    return (
      <header className="flex justify-between items-center p-4 px-[4px] border-b border-gray-300">
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
      </header>
    );
  } else if (variant === "auth") {
    return (
      <header className="flex justify-between items-center p-4 px-[112px] border-b border-gray-300">
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
      <header className="flex justify-between items-center p-4 px-[4px] border-b border-gray-300">
        <div className="flex justify-center items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={headerlogo} alt="logo" />
          </div>
          <nav className="flex gap-5 text-md font-semibold">
            <Link
              to="/admindashboard"
              className={
                pathname === "/admindashboard"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
              }
            >
              Home
            </Link>
            <Link
              to="/admincustomers"
              className={
                pathname === "/admincustomers"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
              }
            >
              Customers
            </Link>
            <Link
              to="/adminrewards"
              className={
                pathname === "/adminrewards"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
              }
            >
              Rewards
            </Link>
            <Link
              to="/admintransactions"
              className={
                pathname === "/admintransactions"
                  ? "text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
              }
            >
              Transactions
            </Link>
          </nav>
        </div>
      </header>
    );
  }
}
