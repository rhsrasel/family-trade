"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LedgerManager({
  initialLedgers,
  companies = [],
  markets = [],
}) {
  const router = useRouter();

  const [ledgers, setLedgers] = useState(initialLedgers || []);

  const [companyName, setCompanyName] = useState("");

  const [marketName, setMarketName] = useState("");

  const [ledgerDate, setLedgerDate] = useState(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  async function readResponse(response) {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  }

  async function createLedger() {
    if (!companyName) {
      alert("Please select a company.");
      return;
    }

    if (!marketName) {
      alert("Please select a market.");
      return;
    }

    if (!ledgerDate) {
      alert("Date is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          marketName: marketName.trim(),
          ledgerDate,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create ledger.");
      }

      const savedLedger = data.ledger;

      if (!savedLedger?.id) {
        throw new Error("Ledger was created but no ledger data was returned.");
      }

      setLedgers((currentLedgers) => [savedLedger, ...currentLedgers]);

      setCompanyName("");
      setMarketName("");

      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      setLedgerDate(`${year}-${month}-${day}`);
    } catch (error) {
      console.error("CREATE LEDGER ERROR:", error);

      alert(error?.message || "Failed to create ledger.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLedger(ledger) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${ledger.companyName} - ${ledger.marketName || "No market"}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(ledger.id);

    try {
      const response = await fetch(`/api/ledger?id=${ledger.id}`, {
        method: "DELETE",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete ledger.");
      }

      setLedgers((currentLedgers) =>
        currentLedgers.filter((item) => item.id !== ledger.id),
      );
    } catch (error) {
      console.error("DELETE LEDGER ERROR:", error);

      alert(error?.message || "Failed to delete ledger.");
    } finally {
      setDeletingId(null);
    }
  }

  const groupedLedgers = ledgers.reduce((groups, ledger) => {
    const date = new Date(ledger.ledgerDate);

    const key = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(ledger);

    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Create Ledger</h2>

          <p className="mt-1 text-sm text-gray-500">
            Select the company, market and date.
          </p>
        </div>

        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Company Name
              </label>

              <select
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              >
                <option value="">Select company</option>

                {companies.map((company) => (
                  <option key={company.id} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Market Name
              </label>

              <select
                value={marketName}
                onChange={(event) => setMarketName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              >
                <option value="">Select market</option>

                {markets.map((market) => (
                  <option key={market.id} value={market.name}>
                    {market.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Date
              </label>

              <input
                type="date"
                value={ledgerDate}
                onChange={(event) => setLedgerDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={createLedger}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Ledger"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedLedgers).map(([date, dateLedgers]) => (
          <div key={date}>
            <h3 className="mb-3 text-sm font-bold text-gray-500">{date}</h3>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {dateLedgers.map((ledger) => (
                <div
                  key={ledger.id}
                  className="flex items-center justify-between border-b border-gray-100 px-4 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">
                      {ledger.companyName} - {ledger.marketName || "No market"}
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      {ledger.name}
                    </div>
                  </div>

                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/ledger/${ledger.id}`)}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteLedger(ledger)}
                      disabled={deletingId === ledger.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === ledger.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {ledgers.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
            <p className="text-sm text-gray-500">No ledgers created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
