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
    <section className="cyber-panel cyber-panel-hover cyber-panel-terminal p-5 md:p-6">
      <div className="cyber-panel-header">
        <div>
          <div className="cyber-terminal-bar">
            <span className="cyber-terminal-dot text-[var(--destructive)]" />
            <span className="cyber-terminal-dot text-[var(--accent-secondary)]" />
            <span className="cyber-terminal-dot text-[var(--accent)]" />
            protocol/action
          </div>
          <h3 className="cyber-title mt-4">{title}</h3>
          <p className="cyber-description mt-2 text-sm">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {children}

        {status ? (
          <div className="cyber-row">
            <span className="cyber-row-label">Status</span>
            <span className="cyber-row-value text-[var(--accent)]">{status}</span>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-[var(--destructive)]">{errorMessage}</p>
        ) : null}

        {footer ? <div className="flex flex-wrap gap-2">{footer}</div> : null}
      </div>
    </section>
  );
}
