import Link from "next/link";
import {connectDB} from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Company from "@/lib/models/Company";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminPage() {
  await connectDB();

  const [userCount, productCount, companyCount] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Company.countDocuments(),
    ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Administration"
        description="Administration"
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link
            href="/admin/products"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {productCount}
            </p>
            <p className="inline-block mt-4 text-right border-b border-indigo-600 pb-0.5 text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
              Manage Products
            </p>
          </Link>

          <Link
            href="/admin/companies"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Total Companies
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {companyCount}
            </p>
            <p className="inline-block mt-4 text-right border-b border-indigo-600 pb-0.5 text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
              Manage Companies
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {userCount}
            </p>
            <p className="inline-block mt-4 text-right border-b border-indigo-600 pb-0.5 text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
              Manage Users
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}