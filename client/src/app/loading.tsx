import React from "react";
import { GraduationCap } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-burgundy-700 selection:text-white">
      <div className="flex flex-col items-center gap-3.5 animate-in fade-in-0 duration-300">
        <div className="w-12 h-12 rounded-2xl bg-burgundy-700 text-white flex items-center justify-center shadow-md shadow-burgundy-900/10">
          <GraduationCap className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            UEMP
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Lead Web Praxis University
          </span>
        </div>
      </div>
    </div>
  );
}
