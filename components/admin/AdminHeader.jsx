import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminHeader({title, description}) {
  return (
    <header className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-rose-50 to-amber-50 pt-16 sm:pt-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-xl font-bold text-gray-900 transition hover:text-indigo-600"
          >
            Family Trade
          </Link>

          <p className="mt-1 text-sm text-gray-600">
            {description || title}
          </p>
        </div>

        <div className="flex w-full items-center sm:w-auto">
          <Link
            href="/admin"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            Dashboard
          </Link>

          <div className="ml-3 [&>button]:w-full">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}