"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function createAdmin(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/admins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Something went wrong."
        );
        return;
      }

      alert("Admin created successfully.");

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Create Admin"
        description="Create a new admin account."
      />

      <div className="mx-auto max-w-7xl px-6 py-6">
        <form
          onSubmit={createAdmin}
          className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        >
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Create Admin
          </h2>

          <div className="grid gap-4">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Admin"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Input({label, ...props}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>

      <input
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}