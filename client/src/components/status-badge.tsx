import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
    confirmed: { variant: "default", label: "Confirmed" },
    pending: { variant: "secondary", label: "Pending" },
    completed: { variant: "outline", label: "Completed" },
    cancelled: { variant: "destructive", label: "Cancelled" },
    active: { variant: "default", label: "Active" },
  };

  const config = variants[normalizedStatus] || { variant: "secondary" as const, label: status };

  return (
    <Badge variant={config.variant} data-testid={`badge-status-${normalizedStatus}`}>
      {config.label}
    </Badge>
  );
}
