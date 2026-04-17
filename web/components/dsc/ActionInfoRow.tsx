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
    <div className="flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`break-all text-sm font-medium ${valueClassName ?? ""}`}>
        {value ?? "--"}
      </span>
    </div>
  );
}
