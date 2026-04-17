import { ReactNode } from "react";

type ActionCardShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  status?: string | null;
  errorMessage?: string | null;
};

export function ActionCardShell({
  title,
  description,
  children,
  footer,
  status,
  errorMessage,
}: ActionCardShellProps) {
  return (
    <section className="rounded-2xl border p-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 space-y-4">
        {children}

        {status ? (
          <div className="rounded-xl border px-3 py-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium">{status}</span>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-red-500">{errorMessage}</p>
        ) : null}

        {footer ? <div className="flex flex-wrap gap-2">{footer}</div> : null}
      </div>
    </section>
  );
}
