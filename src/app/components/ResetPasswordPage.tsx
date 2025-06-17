"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavBar from "./NavBar";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error("Invalid reset link");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated");
        router.push("/login");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <NavBar current={-1} />
      </div>
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 via-amber-50 to-green-100 pt-24">
        <form
          onSubmit={handleSubmit}
          className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full mb-4 px-4 py-2 border rounded"
            required
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full mb-4 px-4 py-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {isLoading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordPage;