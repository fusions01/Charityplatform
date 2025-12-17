import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Clock,
  Banknote,
  Users,
  TrendingUp,
  Loader2,
  Shield,
  Building2,
  Calendar,
} from "lucide-react";
import type { Application } from "@shared/schema";

interface ApplicationWithUser extends Application {
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string | null;
    isVerified: string;
  };
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: applications, isLoading } = useQuery<ApplicationWithUser[]>({
    queryKey: ["/api/admin/applications"],
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/admin/applications/${id}`, { status, adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({
        title: "Application Updated",
        description: "The application status has been updated successfully.",
      });
      setIsDetailOpen(false);
      setIsRejectDialogOpen(false);
      setRejectReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update application.",
        variant: "destructive",
      });
    },
  });

  const filteredApplications = applications?.filter((app) => {
    const matchesSearch =
      app.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${app.user?.firstName} ${app.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter((a) => a.status === "pending").length || 0,
    underReview: applications?.filter((a) => a.status === "under_review").length || 0,
    approved: applications?.filter((a) => a.status === "approved" || a.status === "paid").length || 0,
  };

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

  const handleApprove = (app: ApplicationWithUser) => {
    updateStatusMutation.mutate({ id: app.id, status: "approved" });
  };

  const handleReject = () => {
    if (selectedApplication) {
      updateStatusMutation.mutate({
        id: selectedApplication.id,
        status: "rejected",
        notes: rejectReason,
      });
    }
  };

  const handleMarkUnderReview = (app: ApplicationWithUser) => {
    updateStatusMutation.mutate({ id: app.id, status: "under_review" });
  };

  const handleMarkPaid = (app: ApplicationWithUser) => {
    updateStatusMutation.mutate({ id: app.id, status: "paid" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2" data-testid="text-admin-title">
                <Shield className="h-7 w-7 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Review and manage assistance applications
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="admin-stat-total">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : stats.total}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="admin-stat-pending">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : stats.pending}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Under Review
                </CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="admin-stat-under-review">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : stats.underReview}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved / Paid
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="admin-stat-approved">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : stats.approved}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or reason..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredApplications && filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Request</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id} data-testid={`row-application-${app.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {app.user?.firstName} {app.user?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{app.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-xs truncate">{app.reason}</p>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(app.amountRequested, app.currency)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(app.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-actions-${app.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setIsDetailOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {app.status === "pending" && (
                                  <DropdownMenuItem onClick={() => handleMarkUnderReview(app)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Mark Under Review
                                  </DropdownMenuItem>
                                )}
                                {(app.status === "pending" || app.status === "under_review") && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApprove(app)}>
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedApplication(app);
                                        setIsRejectDialogOpen(true);
                                      }}
                                    >
                                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {app.status === "approved" && (
                                  <DropdownMenuItem onClick={() => handleMarkPaid(app)}>
                                    <Banknote className="mr-2 h-4 w-4 text-primary" />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Applications Found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "No applications have been submitted yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Application Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the complete application information
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedApplication.status} />
                <span className="text-sm text-muted-foreground">
                  Submitted {formatDate(selectedApplication.createdAt)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Applicant</p>
                  <p className="font-medium">
                    {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Requested</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(selectedApplication.amountRequested, selectedApplication.currency)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Reason for Assistance</p>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p>{selectedApplication.reason}</p>
                </div>
              </div>

              {selectedApplication.bankDetails && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Bank Details</p>
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{selectedApplication.bankDetails.bankName}</p>
                          <p className="text-sm text-muted-foreground">
                            ****{selectedApplication.bankDetails.accountNumber.slice(-4)}
                          </p>
                          {selectedApplication.bankDetails.accountHolderName && (
                            <p className="text-sm">
                              Account Holder: {selectedApplication.bankDetails.accountHolderName}
                            </p>
                          )}
                        </div>
                        {selectedApplication.bankDetails.isVerified === "verified" && (
                          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedApplication.adminNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm">{selectedApplication.adminNotes}</p>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                {(selectedApplication.status === "pending" || selectedApplication.status === "under_review") && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsRejectDialogOpen(true);
                        setIsDetailOpen(false);
                      }}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedApplication)}
                      disabled={updateStatusMutation.isPending}
                      className="gap-1"
                    >
                      {updateStatusMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </>
                )}
                {selectedApplication.status === "approved" && (
                  <Button
                    onClick={() => handleMarkPaid(selectedApplication)}
                    disabled={updateStatusMutation.isPending}
                    className="gap-1"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Banknote className="h-4 w-4" />
                    )}
                    Mark as Paid
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Enter the reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-32"
            data-testid="input-reject-reason"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || updateStatusMutation.isPending}
              data-testid="button-confirm-reject"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
