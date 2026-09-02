import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminHeader({title, description}) {
  return (
<header className="border-b bg-white pt-16 sm:pt-5">
  <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <Link
        href="/admin"
        className="text-xl font-bold text-gray-900 hover:text-indigo-600"
      >
        Family Trade
      </Link>

      <p className="mt-1 text-sm text-gray-500">
        {description || title}
      </p>
    </div>

    <div className="flex w-full items-center gap-3 sm:w-auto">
      <Link
        href="/admin"
        className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:flex-none"
      >
        Dashboard
      </Link>
      <LogoutButton />
    </div>
  </div>
</header>
  );
}