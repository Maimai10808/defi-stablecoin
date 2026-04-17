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
        "cyber-button cyber-button-ghost",
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
