// app/page.jsx

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          M/S Family Trade Link
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
          Welcome to Family Trade. Manage your account, access available
          services, and stay connected with your family trade community.
        </p>

        <div className="mt-10 grid w-full max-w-md gap-3 sm:grid-cols-2">
          <Link
            href="/admin/login"
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            Admin Login
          </Link>

          <Link
            href="/user/login"
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            User Login
          </Link>

          <Link
            href="/user/create"
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 sm:col-span-2"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}