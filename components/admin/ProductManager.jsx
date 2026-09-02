"use client";

import Link from "next/link";
import {useState} from "react";

const emptyForm = {
  title: "",
  stock: "",
  dp: "",
  tp: "",
  company: "",
};

export default function ProductManager({
  initialProducts,
  companies,
}) {
  const [products, setProducts] = useState(initialProducts);
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

  async function createProduct(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
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

      setProducts((current) => [
        data.product,
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

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) {
      return;
    }

    setLoadingId(id);

    try {
      const response = await fetch("/api/admin/products", {
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

      setProducts((current) =>
        current.filter((product) => product.id !== id)
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
            All Products ({products.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createProduct}
          className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        >
          <h3 className="mb-5 font-semibold text-gray-900">
            Add Product
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <Input
              label="Stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />

            <Input
              label="DP"
              name="dp"
              type="number"
              min="0"
              step="0.01"
              value={form.dp}
              onChange={handleChange}
              required
            />

            <Input
              label="TP"
              name="tp"
              type="number"
              min="0"
              step="0.01"
              value={form.tp}
              onChange={handleChange}
              required
            />

            <CompanyPicker
              companies={companies}
              value={form.company}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  company: value,
                }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                  Title
                </th>

                <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                  Stock
                </th>

                <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                  DP
                </th>

                <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                  TP
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Profit
                </th>
                
                <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                  Company
                </th>

                <th className="px-5 py-4 text-left text-sm font-bold text-gray-700">
                  Orders
                </th>

                <th className="px-5 py-4 text-right text-sm font-bold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  loading={loadingId === product.id}
                  onDelete={deleteProduct}
                />
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No products yet.
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

function ProductRow({
  product,
  loading,
  onDelete,
}) {
  return (
    <tr className="align-top">
      <td className="px-5 py-5">
        <span className="font-medium text-gray-900">
          {product.title}
        </span>
      </td>

      <td className="px-5 py-5">
        {product.stock}
      </td>

      <td className="px-5 py-5">
        {product.dp}
      </td>

      <td className="px-5 py-5">
        {product.tp}
      </td>

      <td className="px-5 py-5">
          {Number(product.tp) - Number(product.dp)}
      </td>

      <td className="px-5 py-5">
        {product.company}
      </td>

      <td className="px-5 py-5">
        {product.orderHistory?.length || 0}
      </td>

      <td className="px-5 py-5">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/products/${product.id}`}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Edit
          </Link>

          <button
            type="button"
            disabled={loading}
            onClick={() => onDelete(product.id)}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function CompanyPicker({
  companies,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCompanies = companies.filter(
    (company) =>
      company.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  function selectCompany(company) {
    onChange(company.name);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">
          Company
        </span>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <span
            className={
              value
                ? "text-gray-900"
                : "text-gray-400"
            }
          >
            {value || "Select company"}
          </span>

          <span className="text-gray-400">
            ▾
          </span>
        </button>
      </label>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="border-b p-2">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search company..."
                autoFocus
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() =>
                      selectCompany(company)
                    }
                    className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {company.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No companies found.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Input({
  label,
  ...props
}) {
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