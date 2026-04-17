type ActionInfoRowProps = {
  label: string;
  value: string | number | null | undefined;
  valueClassName?: string;
};

export function ActionInfoRow({
  label,
  value,
  valueClassName,
}: ActionInfoRowProps) {
  return (
    <div className="cyber-row">
      <span className="cyber-row-label">{label}</span>
      <span className={`cyber-row-value break-all ${valueClassName ?? ""}`}>
        {value ?? "--"}
      </span>
    </div>
  );
}
