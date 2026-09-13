"use client";

import {useState} from "react";

const emptyForm = {
  name: "",
  address: "",
};

export default function MarketManager({
  initialMarkets,
}) {
  const [markets, setMarkets] = useState(
    initialMarkets
  );

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function createMarket(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/markets",
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

      setMarkets((current) => [
        data.market,
        ...current,
      ]);

      setForm(emptyForm);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteMarket(id) {
    if (!confirm("Delete this market?")) {
      return;
    }

    setLoadingId(id);

    try {
      const response = await fetch(
        "/api/admin/markets",
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

      setMarkets((current) =>
        current.filter(
          (market) => market.id !== id
        )
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            All Markets ({markets.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm((current) => !current)
          }
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "Add Market"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createMarket}
          className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        >
          <h3 className="mb-5 font-semibold text-gray-900">
            Add Market
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Market"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Address
                </th>

                <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {markets.map((market) => (
                <MarketRow
                  key={market.id}
                  market={market}
                  loading={
                    loadingId === market.id
                  }
                  onDelete={deleteMarket}
                />
              ))}

              {markets.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No markets yet.
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

function MarketRow({
  market,
  loading,
  onDelete,
}) {
  return (
    <tr>
      <td className="px-5 py-5">
        <span className="font-medium text-gray-900">
          {market.name}
        </span>
      </td>

      <td className="px-5 py-5 text-gray-700">
        {market.address}
      </td>

      <td className="px-5 py-5">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Edit
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              onDelete(market.id)
            }
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete
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