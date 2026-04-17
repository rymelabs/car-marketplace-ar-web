"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/" || pathname.startsWith("/cars/");
  const isProfileActive = pathname.startsWith("/admin");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ${
            isHomeActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Home
        </Link>
        <Link
          href="/admin"
          className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ${
            isProfileActive
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Profile
        </Link>
      </div>
    </nav>
  );
}
