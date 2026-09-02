"use client";

import {useState} from "react";

const emptyAccess = {
  shop: false,
  cart: false,
  orders: false,
  profile: false,
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export default function UserManager({users: initialUsers}) {
  const [users, setUsers] = useState(initialUsers);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({...emptyForm});

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "pending",
    access: {...emptyAccess},
  });

  const totalUsers = users.length;

  const pendingUsers = users.filter(
    (user) => user.status === "pending"
  ).length;

  const approvedUsers = users.filter(
    (user) => user.status === "approved"
  ).length;

  function resetCreateForm() {
    setForm({...emptyForm});
  }

  function resetEditForm() {
    setEditForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      status: "pending",
      access: {...emptyAccess},
    });
  }

  function cancelEditing() {
    setEditingId(null);
    resetEditForm();
  }

  function handleFormChange(event) {
    const {name, value} = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditChange(event) {
    const {name, value} = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startEditing(user) {
    setEditingId(user.id);

    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      status: user.status || "pending",
      access: {
        shop: user.access?.shop || false,
        cart: user.access?.cart || false,
        orders: user.access?.orders || false,
        profile: user.access?.profile || false,
      },
    });
  }

  function handleEditAccessChange(key, value) {
    setEditForm((current) => ({
      ...current,
      access: {
        ...current.access,
        [key]: value,
      },
    }));
  }

  async function createUser(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }

      setUsers((current) => [
        data.user,
        ...current,
      ]);

      resetCreateForm();
      setCreating(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(id) {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          password: editForm.password,
          status: editForm.status,
          access: editForm.access,
        }),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === id ? data.user : user
        )
      );

      cancelEditing();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function updateAccess(id, key, value) {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          access: {
            [key]: value,
          },
        }),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === id ? data.user : user
        )
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  async function deleteUser(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id}),
      });

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }

      setUsers((current) =>
        current.filter((user) => user.id !== id)
      );

      if (editingId === id) {
        cancelEditing();
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Total Users
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalUsers}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingUsers}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Approved
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {approvedUsers}
          </p>
        </div>
      </div>

      {/* Users */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="divide-y">
          {users.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              No users yet.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="px-5 py-5"
              >
                {editingId === user.id ? (
                  <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        placeholder="Name"
                        required
                        autoFocus
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        placeholder="Email"
                        required
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <input
                        type="text"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        placeholder="Phone"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <input
                        type="password"
                        name="password"
                        value={editForm.password}
                        onChange={handleEditChange}
                        placeholder="New password (optional)"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="pending">
                          Pending
                        </option>

                        <option value="approved">
                          Approved
                        </option>
                      </select>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium text-gray-700">
                        Page Access
                      </p>

                      <div className="flex flex-wrap gap-5">
                        {Object.keys(emptyAccess).map(
                          (key) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  editForm.access[key]
                                }
                                onChange={(event) =>
                                  handleEditAccessChange(
                                    key,
                                    event.target.checked
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />

                              <span className="capitalize">
                                {key}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateUser(user.id)
                        }
                        disabled={loading}
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={loading}
                        className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {user.email}
                      </p>

                      {user.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                          {user.phone}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        {Object.keys(emptyAccess).map(
                          (key) => (
                            <label
                              key={key}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  user.access?.[key] ||
                                  false
                                }
                                onChange={(event) =>
                                  updateAccess(
                                    user.id,
                                    key,
                                    event.target.checked
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />

                              <span className="capitalize">
                                {key}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(user)
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteUser(user.id)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setCreating((current) => !current);
            cancelEditing();
          }}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {creating
            ? "Cancel"
            : "+ Create User"}
        </button>
      </div>

      {/* Create Form */}
      {creating && (
        <form
          onSubmit={createUser}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Name"
              required
              autoFocus
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              placeholder="Email"
              required
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              placeholder="Phone"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              placeholder="Password"
              required
              minLength={4}
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create User"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetCreateForm();
                setCreating(false);
              }}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Admin-created users are automatically approved.
          </p>
        </form>
      )}
    </div>
  );
}