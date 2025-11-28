import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoginPage from "./pages/login-page";
import SignupPage from "./pages/signup-page";
import HomePage from "./pages/home-page";
import RewardsPage from "./pages/rewards-page";
import TransactionPage from "./pages/transaction-page";
import AdminDashboard from "./pages/admin-dashboard";
import AdminRewards from "./pages/admin-rewards";
import AdminCustomers from "./pages/admin-customers";
import AdminTransactions from "./pages/admin-transactions";
import StaffPage from "./pages/staff-page";
import VerificationPage from "./pages/verification";
import ResetPasswordPage from "./pages/reset-password";
import AccountPage from "./pages/account-page";

function App() {
  return (
    <>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/verify-email/:token" element={<VerificationPage />} />
            <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
