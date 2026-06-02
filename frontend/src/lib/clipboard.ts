import { toast } from "sonner";

export async function copyToClipboard(label: string, value?: string | null) {
  if (!value) {
    toast.error(`${label} address is not available`);
    return;
  }

  await navigator.clipboard.writeText(value);
  toast.success(`${label} copied`);
}
