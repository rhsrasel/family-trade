"use client";

import {useState} from "react";
import Link from "next/link";

export default function AdminManager({admins: initialAdmins}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  function handleChange(event) {
    const {name, value, type, checked} = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEdit(admin) {
    setEditingId(admin.id);

    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      active: admin.active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(null);
  }

  async function saveAdmin(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/admins",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingId,
            ...form,
          }),
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

      setAdmins((current) =>
        current.map((admin) =>
          admin.id === editingId
            ? data.admin
            : admin
        )
      );

      cancelEdit();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAdmin(id) {
    if (!confirm("Delete this admin?")) {
      return;
    }

    setLoadingId(id);

    try {
      const response = await fetch(
        "/api/admin/admins",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({id}),
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

      setAdmins((current) =>
        current.filter(
          (admin) => admin.id !== id
        )
      );

      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {form && (
        <form
          onSubmit={saveAdmin}
          className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Edit Admin
            </h3>

            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              label="New Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={4}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </span>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="admin">
                  Admin
                </option>

                <option value="super_admin">
                  Super Admin
                </option>
              </select>
            </label>

            <label className="flex items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />

              <span className="text-sm font-medium text-gray-700">
                Active
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "Save Admin"}
          </button>
        </form>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            All Admins ({admins.length})
          </h2>
        </div>

        <div className="flex justify-end">
          <Link
            href="/admin/create"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + Add Admin
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {admins.map((admin) => (
                <AdminRow
                  key={admin.id}
                  admin={admin}
                  loading={
                    loadingId === admin.id
                  }
                  onEdit={startEdit}
                  onDelete={deleteAdmin}
                />
              ))}

              {admins.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No admins yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminRow({
  admin,
  loading,
  onEdit,
  onDelete,
}) {
  return (
    <tr>
      <td className="px-5 py-5">
        <span className="font-medium text-gray-900">
          {admin.name}
        </span>
      </td>

      <td className="px-5 py-5 text-gray-700">
        {admin.email}
      </td>

      <td className="px-5 py-5 text-gray-700">
        {admin.role === "super_admin"
          ? "Super Admin"
          : "Admin"}
      </td>

      <td className="px-5 py-5">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            admin.active
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {admin.active
            ? "Active"
            : "Inactive"}
        </span>
      </td>

      <td className="px-5 py-5">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(admin)}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Edit
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onDelete(admin.id)}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </td>
    </tr>
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