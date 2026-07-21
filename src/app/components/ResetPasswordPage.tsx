"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "./NavBar";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabase";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) {
        toast.success("Password updated");
        await supabase.auth.signOut();
        router.push("/login");
      } else {
        toast.error(error.message || "Failed to reset password");
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
