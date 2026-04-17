"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionSecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
};

export function ActionSecondaryButton({
  children,
  className = "",
  fullWidth = false,
  type = "button",
  ...props
}: ActionSecondaryButtonProps) {
  return (
    <button
      type={type}
      className={[
        fullWidth ? "w-full" : "",
        "rounded-xl border px-4 py-2 font-medium text-muted-foreground transition-opacity",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
