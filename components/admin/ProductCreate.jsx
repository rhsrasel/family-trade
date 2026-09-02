"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

export default function ProductCreate({
  companies,
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [stock, setStock] = useState(0);
  const [dp, setDp] = useState(0);
  const [tp, setTp] = useState(0);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  async function createProduct(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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

      router.replace(
        `/admin/products/${data.product.id}`
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={createProduct}
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
    >
      <div className="grid gap-4">
        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="Product title"
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          required
        />

        <select
          value={company}
          onChange={(event) =>
            setCompany(event.target.value)
          }
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          required
        >
          <option value="">Select company</option>

          {companies.map((item) => (
            <option
              key={item.id}
              value={item.name}
            >
              {item.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          value={stock}
          onChange={(event) =>
            setStock(event.target.value)
          }
          placeholder="Stock"
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
          required
        />

        <input
          type="number"
          min="0"
          value={dp}
          onChange={(event) =>
            setDp(event.target.value)
          }
          placeholder="DP"
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
          required
        />

        <input
          type="number"
          min="0"
          value={tp}
          onChange={(event) =>
            setTp(event.target.value)
          }
          placeholder="TP"
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading || companies.length === 0}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}