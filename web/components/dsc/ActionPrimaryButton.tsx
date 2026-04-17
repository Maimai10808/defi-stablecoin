"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
};

export function ActionPrimaryButton({
  children,
  className = "",
  fullWidth = true,
  type = "button",
  ...props
}: ActionPrimaryButtonProps) {
  return (
    <button
      type={type}
      className={[
        fullWidth ? "w-full" : "",
        "rounded-xl border px-4 py-2 font-medium transition-opacity",
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
