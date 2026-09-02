"use client";

import {useState} from "react";
import Link from "next/link";

export default function CompanyManager({
  initialCompanies,
}) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  async function createCompany(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
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

      setCompanies((current) => [
        {
          ...data.company,
          productsCount: 0,
        },
        ...current,
      ]);

      setName("");
      setCreating(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCompany(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/admin/companies", {
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

      setCompanies((current) =>
        current.filter((company) => company.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Companies ({companies.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setCreating((current) => !current)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {creating ? "Cancel" : "+ Create Company"}
        </button>
      </div>

      {creating && (
        <form
          onSubmit={createCompany}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
        >
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Company name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              autoFocus
              required
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setName("");
                }}
                disabled={loading}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Companies
          </h2>
        </div>

        <div className="divide-y">
          {companies.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              No companies yet.
            </div>
          ) : (
            companies.map((company, index) => (
              <div
                key={company.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/admin/companies/${company.id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {company.name}
                  </Link>

                  <div className="mt-1 flex gap-4 text-xs text-gray-500">
                    <span>
                      #{companies.length - index}
                    </span>

                    <span>
                      {company.productsCount || 0}{" "}
                      {company.productsCount === 1
                        ? "product"
                        : "products"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/companies/${company.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCompany(company.id)
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}