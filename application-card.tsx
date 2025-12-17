import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Calendar, Banknote, FileText, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Application } from "@shared/schema";

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: string | null, currency: string) => {
    if (!amount) return "N/A";
    const symbol = currency === "GBP" ? "£" : "$";
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
  };

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-application-${application.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="font-semibold leading-none tracking-tight truncate" data-testid="text-application-reason">
            {application.reason.length > 50
              ? `${application.reason.substring(0, 50)}...`
              : application.reason}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(application.createdAt)}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Banknote className="h-4 w-4" />
            <span className="text-sm">Amount Requested</span>
          </div>
          <span className="font-semibold text-lg" data-testid="text-amount-requested">
            {formatCurrency(application.amountRequested, application.currency)}
          </span>
        </div>

        {application.supportingDocuments && application.supportingDocuments.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{application.supportingDocuments.length} document(s) attached</span>
          </div>
        )}

        {application.status === "paid" && application.paidAmount && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-400 font-medium">
              Payment received: {formatCurrency(application.paidAmount, application.currency)}
            </p>
            {application.paidAt && (
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                Paid on {formatDate(application.paidAt)}
              </p>
            )}
          </div>
        )}

        <Link href={`/application/${application.id}`}>
          <Button variant="ghost" className="w-full justify-between group" data-testid="button-view-application">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
