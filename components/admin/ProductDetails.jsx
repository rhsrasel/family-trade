"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function ProductDetails({
  initialProduct,
  initialCompanies,
}) {
  const router = useRouter();

  const [product, setProduct] = useState(
    initialProduct
  );

  const [title, setTitle] = useState(
    initialProduct.title
  );
  const [stock, setStock] = useState(
    initialProduct.stock
  );
  const [dp, setDp] = useState(initialProduct.dp);
  const [tp, setTp] = useState(initialProduct.tp);
  const [company, setCompany] = useState(
    initialProduct.company
  );

  const [saving, setSaving] = useState(false);

  async function saveProduct(event) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
            title,
            stock,
            dp,
            tp,
            company,
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

      setProduct(data.product);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (
      !confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
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

      router.replace("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-gray-500 hover:text-indigo-600"
        >
          ← Products
        </Link>

        <button
          type="button"
          onClick={deleteProduct}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Delete Product
        </button>
      </div>

      <form
        onSubmit={saveProduct}
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Product Title
            </span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Company
            </span>

            <select
              value={company}
              onChange={(event) =>
                setCompany(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            >
              <option value="">
                Select company
              </option>

              {initialCompanies.map((item) => (
                <option
                  key={item.id}
                  value={item.name}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Stock
            </span>

            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) =>
                setStock(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              DP
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={dp}
              onChange={(event) =>
                setDp(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              TP
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={tp}
              onChange={(event) =>
                setTp(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </form>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Order History
          </h2>
        </div>

        {product.orderHistory?.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-3">
                    Date
                  </th>
                  <th className="px-5 py-3">
                    Quantity
                  </th>
                  <th className="px-5 py-3">
                    Type
                  </th>
                  <th className="px-5 py-3">
                    Note
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {[...(product.orderHistory || [])]
                  .sort(
                    (a, b) =>
                      new Date(b.date) -
                      new Date(a.date)
                  )
                  .map((order) => (
                    <tr key={order.id}>
                      <td className="px-5 py-4">
                        {new Date(
                          order.date
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        {order.quantity}
                      </td>

                      <td className="px-5 py-4">
                        {order.type}
                      </td>

                      <td className="px-5 py-4">
                        {order.note || "-"}
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