// components/BackHome.jsx

"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";

export default function BackHome() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="fixed left-6 top-6 z-50">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <span>←</span>
        Back to Home
      </Link>
    </div>
  );
}