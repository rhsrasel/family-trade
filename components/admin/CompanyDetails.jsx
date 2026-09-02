"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function CompanyDetails({
  company,
  initialProducts,
}) {
  const router = useRouter();

  const [name, setName] = useState(company.name);
  const [products] = useState(initialProducts);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function updateCompany(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/companies",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: company.id,
            name,
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
        alert(data.message || "Something went wrong.");
        return;
      }

      setName(data.company.name);
      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCompany() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/companies",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: company.id,
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
        alert(data.message || "Something went wrong.");
        return;
      }

      router.replace("/admin/companies");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  function cancelEditing() {
    setName(company.name);
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/companies"
          className="text-sm font-medium text-gray-500 hover:text-indigo-600"
        >
          ← Back to Companies
        </Link>
      </div>

      {/* Company Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        {!editing ? (
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {company.name}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {products.length}{" "}
                {products.length === 1
                  ? "Product"
                  : "Products"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={deleteCompany}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={updateCompany}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Products */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Products
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            No products for this company.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-600">
                    Product
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-600">
                    Stock
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-600">
                    DP
                  </th>

                  <th className="px-5 py-3 font-semibold text-gray-600">
                    TP
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {product.title}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {product.stock}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {product.dp}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {product.tp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}