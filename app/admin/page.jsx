import Link from "next/link";
import {connectDB} from "@/lib/db";
import User from "@/lib/models/User";
import Admin from "@/lib/models/Admin";
import Product from "@/lib/models/Product";
import Company from "@/lib/models/Company";
import Market from "@/lib/models/Market";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminPage() {
  await connectDB();

  const [
    userCount,
    adminCount,
    productCount,
    companyCount,
    marketCount,
  ] = await Promise.all([
    User.countDocuments(),
    Admin.countDocuments(),
    Product.countDocuments(),
    Company.countDocuments(),
    Market.countDocuments(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Administration"
        description="Administration"
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/admin/admins"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Total Admins
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {adminCount}
            </p>

            <p className="mt-4 inline-block border-b border-indigo-600 pb-0.5 text-right text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
              Manage Admins
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

            <p className="mt-4 inline-block border-b border-indigo-600 pb-0.5 text-right text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
              Manage Users
            </p>
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
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

            <p className="mt-4 inline-block border-b border-indigo-600 pb-0.5 text-right text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
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

            <p className="mt-4 inline-block border-b border-indigo-600 pb-0.5 text-right text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
              Manage Companies
            </p>
          </Link>

          <Link
            href="/admin/markets"
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Total Markets
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {marketCount}
            </p>

            <p className="mt-4 inline-block border-b border-indigo-600 pb-0.5 text-right text-sm font-medium text-indigo-600 transition hover:border-indigo-900 hover:text-indigo-900">
              Manage Markets
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}