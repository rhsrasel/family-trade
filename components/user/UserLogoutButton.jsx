"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      router.replace("/user/login");
      router.refresh();
    } catch (error) {
      console.error("USER LOGOUT ERROR:", error);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
