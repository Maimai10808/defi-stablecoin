"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type MotionCopyButtonProps = { value?: string | null; label?: string; className?: string };

export function MotionCopyButton({ value, label = "Copy", className }: MotionCopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  async function handleCopy() { if (!value) return; await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1300); }
  return (
    <button type="button" onClick={handleCopy} disabled={!value} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? <motion.span key="check" initial={{ opacity: 0, scale: 0.65, rotate: -18 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.65, rotate: 18 }} transition={{ duration: 0.18 }}><Check className="size-4" /></motion.span> : <motion.span key="copy" initial={{ opacity: 0, scale: 0.65, rotate: 18 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.65, rotate: -18 }} transition={{ duration: 0.18 }}><Copy className="size-4" /></motion.span>}
      </AnimatePresence>
      {copied ? "Copied" : label}
    </button>
  );
}
