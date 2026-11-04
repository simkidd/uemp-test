"use client";

import React, { useEffect } from "react";
import { Printer, X, Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface A4DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function A4DocumentModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: A4DocumentModalProps) {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/80 backdrop-blur-md overflow-hidden animate-in fade-in-0 duration-200">
      {/* Top Modal Navigation Toolbar */}
      <div className="h-16 px-4 sm:px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-burgundy-600/20 text-burgundy-300 border border-burgundy-500/30 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              {title}
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-burgundy-950 text-burgundy-300 border border-burgundy-800">
                Preview
              </span>
            </h3>
            {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            size="sm"
            className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Realistic A4 Document Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-zinc-950/60 font-sans">
        <div className="w-full max-w-[210mm] my-auto">
          {/* A4 Realistic White Paper Sheet */}
          <div
            id="printable-a4-document"
            className="w-full min-h-[297mm] bg-white text-zinc-950 p-[15mm] sm:p-[20mm] rounded-sm shadow-2xl relative border border-zinc-200 flex flex-col justify-between"
          >
            {/* Subtle Institutional Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.035] select-none">
              <span className="text-[140px] font-black uppercase tracking-widest text-zinc-900 rotate-[-30deg]">
                UEMP
              </span>
            </div>

            {/* Document Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-between space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
