import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function VerificationPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying your account...");

  useEffect(() => {
    if (token) {
      // Call the verification endpoint
      axios.get(`/api/auth/verify-email/${token}`)
        .then(() => {
          setStatus("Account verified successfully!");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        })
        .catch((error) => {
          setStatus(error.response?.data?.message || "Failed to verify account. Please try again or contact support.");
        });
    }
  }, [token, navigate]);

  return (
    <div className="h-screen w-screen bg-white flex flex-col justify-center items-center">
      <div className={`text-2xl ${status.includes("successfully") ? "text-green-600" : "text-gray-600"} mb-4`}>
        {status}
      </div>
      {status.includes("successfully") && (
        <div className="text-gray-600">
          Redirecting to login...
        </div>
      )}
    </div>
  );
}
