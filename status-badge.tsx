import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Banknote, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "paid";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  paid: {
    label: "Paid",
    icon: Banknote,
    className: "bg-primary/10 text-primary dark:bg-primary/20 border-primary/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
