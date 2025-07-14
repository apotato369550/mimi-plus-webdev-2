import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home-page.jsx";
import LoginPage from "./pages/login-page.jsx";
import SignupPage from "./pages/signup-page.jsx";
import RewardsPage from "./pages/rewards-page.jsx";
import TransactionsPage from "./pages/transaction-page.jsx";
import AdminDashboard from "./pages/admin-dashboard.jsx";
import AdminCustomers from "./pages/admin-customers.jsx";
import AdminRewards from "./pages/admin-rewards.jsx";
import AdminTransactions from "./pages/admin-transactions.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admincustomers" element={<AdminCustomers />} />
        <Route path="/adminrewards" element={<AdminRewards />} />
        <Route path="/admintransactions" element={<AdminTransactions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
