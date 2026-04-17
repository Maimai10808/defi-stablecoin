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
        "cyber-button",
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
