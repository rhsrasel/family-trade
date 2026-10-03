"use client";

import { useMemo, useState } from "react";

const columns = [
  "Nature",
  "Stock",
  "Order",
  "DP",
  "TP",
  "Profit",
  "Value",
  "Return",
  "Value",
  "Delivery",
  "Value",
  "Profit",
];

export default function LedgerTable({
  ledgerId,
  initialRows,
  initialCompanyName,
  initialMarketName,
  ledgerName,
  ledgerDate,
  companies,
  markets,
  products,
}) {
  const [rows, setRows] = useState(initialRows || []);

  const [companyName, setCompanyName] = useState(initialCompanyName || "");

  const [marketName, setMarketName] = useState(initialMarketName || "");

  const [editingRowId, setEditingRowId] = useState(null);

  const [editProductId, setEditProductId] = useState("");

  const [saving, setSaving] = useState(false);

  const [addingProduct, setAddingProduct] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");

  const isProductAlreadyAdded = (productId, exceptRowId = null) => {
    return rows.some(
      (row) => row.productId === productId && row.id !== exceptRowId,
    );
  };

  const createRow = (product) => {
    return {
      id: crypto.randomUUID(),
      productId: product.id,
      nature: product.title,
      company: product.company,
      stock: Number(product.stock) || 0,
      order: "",
      dp: Number(product.dp) || 0,
      tp: Number(product.tp) || 0,
      profit: 0,
      value: 0,
      return: "",
      returnValue: 0,
      delivery: 0,
      deliveryValue: 0,
      deliveryProfit: 0,
    };
  };

  const calculateRow = (row) => {
    const order =
      row.order === "" || row.order === null ? 0 : Number(row.order) || 0;

    const returnQuantity =
      row.return === "" || row.return === null ? 0 : Number(row.return) || 0;

    const dp = Number(row.dp) || 0;
    const tp = Number(row.tp) || 0;

    const profit = tp - dp;
    const value = order * tp;
    const returnValue = returnQuantity * tp;
    const delivery = order - returnQuantity;
    const deliveryValue = delivery * tp;
    const deliveryProfit = value - returnValue;

    return {
      ...row,
      profit,
      value,
      returnValue,
      delivery,
      deliveryValue,
      deliveryProfit,
    };
  };

  const calculatedRows = useMemo(() => {
    return rows.map(calculateRow);
  }, [rows]);

  const totals = useMemo(() => {
    return calculatedRows.reduce(
      (total, row) => ({
        order: total.order + (Number(row.order) || 0),

        value: total.value + (Number(row.value) || 0),

        return: total.return + (Number(row.return) || 0),

        returnValue: total.returnValue + (Number(row.returnValue) || 0),

        delivery: total.delivery + (Number(row.delivery) || 0),

        deliveryValue: total.deliveryValue + (Number(row.deliveryValue) || 0),

        deliveryProfit:
          total.deliveryProfit + (Number(row.deliveryProfit) || 0),
      }),
      {
        order: 0,
        value: 0,
        return: 0,
        returnValue: 0,
        delivery: 0,
        deliveryValue: 0,
        deliveryProfit: 0,
      },
    );
  }, [calculatedRows]);

  const handleCompanyChange = (event) => {
    const selectedCompany = event.target.value;

    if (!selectedCompany) {
      return;
    }

    setCompanyName(selectedCompany);

    const companyProducts = products.filter(
      (product) =>
        product.company?.toLowerCase() === selectedCompany.toLowerCase(),
    );

    const newProducts = companyProducts.filter(
      (product) => !isProductAlreadyAdded(product.id),
    );

    if (newProducts.length > 0) {
      setRows((currentRows) => [...currentRows, ...newProducts.map(createRow)]);
    }

    event.target.value = "";
  };

  const handleAddProduct = () => {
    if (!selectedProductId) {
      return;
    }

    const product = products.find((item) => item.id === selectedProductId);

    if (!product) {
      return;
    }

    if (isProductAlreadyAdded(product.id)) {
      alert("This product is already in the ledger.");
      return;
    }

    setRows((currentRows) => [...currentRows, createRow(product)]);

    setSelectedProductId("");
    setAddingProduct(false);
  };

  const startEdit = (row) => {
    setEditingRowId(row.id);
    setEditProductId(row.productId);
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditProductId("");
  };

  const saveEdit = (rowId) => {
    const product = products.find((item) => item.id === editProductId);

    if (!product) {
      return;
    }

    if (isProductAlreadyAdded(product.id, rowId)) {
      alert("This product is already in the ledger.");
      return;
    }

    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          productId: product.id,
          nature: product.title,
          company: product.company,
          stock: Number(product.stock) || 0,
          dp: Number(product.dp) || 0,
          tp: Number(product.tp) || 0,
        };
      }),
    );

    setEditingRowId(null);
    setEditProductId("");
  };

  const removeRow = (rowId) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  };

  const handleInputChange = (rowId, field, value) => {
    if (value !== "" && (!/^\d*\.?\d*$/.test(value) || Number(value) < 0)) {
      return;
    }

    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          [field]: value,
        };
      }),
    );
  };

  const saveLedger = async () => {
    if (!companyName) {
      alert("Company name is required.");
      return;
    }

    if (!marketName) {
      alert("Market name is required.");
      return;
    }

    try {
      setSaving(true);

      const rowsToSave = rows.map(calculateRow);

      const response = await fetch(`/api/ledger/${ledgerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          marketName,
          rows: rowsToSave,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save ledger.");
      }

      setCompanyName(data.ledger.companyName || companyName);

      setMarketName(data.ledger.marketName || marketName);

      setRows(data.ledger.rows || rowsToSave);

      alert("Ledger saved successfully.");
    } catch (error) {
      console.error("SAVE LEDGER ERROR:", error);

      alert(error.message || "Failed to save ledger.");
    } finally {
      setSaving(false);
    }
  };

  const availableProducts = products.filter(
    (product) => !isProductAlreadyAdded(product.id),
  );

  const formatNumber = (value) => {
    const number = Number(value) || 0;

    return number.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  const formattedDate = new Date(ledgerDate);

  const dayName = formattedDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const dateText = formattedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-gray-200 md:grid-cols-4">
          <div className="border-b border-gray-100 px-5 py-4 md:border-b-0 md:border-r">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Market Name
            </div>

            <select
              value={marketName}
              onChange={(event) => setMarketName(event.target.value)}
              className="mt-1 w-full bg-transparent text-base font-bold text-gray-900 outline-none"
            >
              <option value="">Select market</option>

              {markets.map((market) => (
                <option key={market.id} value={market.name}>
                  {market.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-b border-gray-100 px-5 py-4 md:border-b-0 md:border-r">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Company Name
            </div>

            <select
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-1 w-full bg-transparent text-base font-bold text-gray-900 outline-none"
            >
              <option value="">Select company</option>

              {companies.map((company) => (
                <option key={company.id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-b border-gray-100 px-5 py-4 md:border-b-0 md:border-r">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Day
            </div>

            <div className="mt-1 text-base font-bold text-gray-900">
              {dayName}
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Date
            </div>

            <div className="mt-1 text-base font-bold text-gray-900">
              {dateText}
            </div>

            <div className="mt-1 text-xs text-gray-400">{ledgerName}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Ledger Entries
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add products by company or individually.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            defaultValue=""
            onChange={handleCompanyChange}
            className="h-10 min-w-[190px] rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
          >
            <option value="">Select company</option>

            {companies.map((company) => (
              <option key={company.id} value={company.name}>
                {company.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setAddingProduct(true)}
            disabled={availableProducts.length === 0}
            className="h-10 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Product
          </button>
        </div>
      </div>

      {addingProduct && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:bg-white"
          >
            <option value="">Select product</option>

            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddProduct}
              disabled={!selectedProductId}
              className="h-10 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add
            </button>

            <button
              type="button"
              onClick={() => {
                setAddingProduct(false);
                setSelectedProductId("");
              }}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div
          className={
            calculatedRows.length > 2
              ? "max-h-[calc(100dvh-360px)] overflow-y-auto"
              : ""
          }
        >
          <table className="w-full min-w-[1450px] border-collapse text-sm">
            <thead className="sticky top-0 z-20">
              <tr className="border-b border-gray-200 bg-gray-100">
                {columns.map((column, index) => (
                  <th
                    key={`${column}-${index}`}
                    className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-600"
                  >
                    {column}
                  </th>
                ))}

                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {calculatedRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-16 text-center">
                    <div className="text-sm font-medium text-gray-500">
                      No products added yet.
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      Select a company or add a product to begin.
                    </div>
                  </td>
                </tr>
              ) : (
                calculatedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-gray-100 transition hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3.5">
                      {editingRowId === row.id ? (
                        <div className="min-w-[230px] space-y-2">
                          <select
                            value={editProductId}
                            onChange={(event) =>
                              setEditProductId(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                          >
                            <option value="">Select product</option>

                            {products
                              .filter(
                                (product) =>
                                  !isProductAlreadyAdded(product.id, row.id),
                              )
                              .map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.title}
                                </option>
                              ))}
                          </select>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(row.id)}
                              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[260px] font-medium text-gray-900">
                          {row.nature}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-medium text-gray-600">
                      {formatNumber(row.stock)}
                    </td>

                    <td className="px-4 py-3.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.order}
                        onChange={(event) =>
                          handleInputChange(row.id, "order", event.target.value)
                        }
                        className="h-9 w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
                        placeholder="0"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-gray-600">
                      {formatNumber(row.dp)}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-gray-800">
                      {formatNumber(row.tp)}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-gray-700">
                      {formatNumber(row.profit)}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {formatNumber(row.value)}
                    </td>

                    <td className="px-4 py-3.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.return}
                        onChange={(event) =>
                          handleInputChange(
                            row.id,
                            "return",
                            event.target.value,
                          )
                        }
                        className="h-9 w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
                        placeholder="0"
                      />
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {formatNumber(row.returnValue)}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-gray-800">
                      {formatNumber(row.delivery)}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {formatNumber(row.deliveryValue)}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {formatNumber(row.deliveryProfit)}
                    </td>

                    <td className="px-4 py-3.5">
                      {editingRowId !== row.id && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:border-red-200 hover:bg-red-50"
                            aria-label="Remove product"
                            title="Remove product"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 7h12M9 7V4h6v3m-8 0 1 13h6l1-13M10 11v5m4-5v5"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {calculatedRows.length > 0 && (
              <tfoot className="sticky bottom-0 z-20">
                <tr className="border-t-2 border-gray-300 bg-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                  <td
                    colSpan={2}
                    className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-600"
                  >
                    Total
                  </td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    {formatNumber(totals.order)}
                  </td>

                  <td></td>

                  <td></td>

                  <td className="px-4 py-4 font-bold text-gray-900">-</td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    {formatNumber(totals.value)}
                  </td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    {formatNumber(totals.return)}
                  </td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    {formatNumber(totals.returnValue)}
                  </td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    {formatNumber(totals.delivery)}
                  </td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    {formatNumber(totals.deliveryValue)}
                  </td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    {formatNumber(totals.deliveryProfit)}
                  </td>

                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={saveLedger}
            disabled={saving}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Ledger"}
          </button>
        </div>
      </div>
    </div>
  );
}
