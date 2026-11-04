import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-burgundy-700 selection:text-white">
      {/* Left Column: Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-slate-900 text-white flex-col justify-between p-12 xl:p-16 border-r border-slate-800">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy-700 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">
                UEMP
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Lead Web Praxis University
              </span>
            </div>
          </Link>
        </div>

        <div className="my-auto max-w-sm space-y-3">
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-white leading-tight">
            University Education Management Portal
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Centralized academic administration for students, academic staff,
            and university governance.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Form Container */}
      <div className="flex-1 flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-12 xl:p-16 bg-zinc-50/50 dark:bg-zinc-950">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-burgundy-700 text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              UEMP
            </span>
          </Link>

          <div className="hidden lg:block" />
        </div>

        {/* Form */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <React.Suspense fallback={null}>{children}</React.Suspense>
        </div>

        {/* Footer */}
        <div className="w-full text-center text-xs text-zinc-400 pt-6">
          <p>&copy; 2026 Lead Web Praxis University</p>
        </div>
      </div>
    </div>
  );
}
