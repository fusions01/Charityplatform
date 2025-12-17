import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ApplicationCard } from "@/components/application-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  Banknote,
  ArrowRight,
  User,
  AlertCircle,
} from "lucide-react";
import type { Application } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter((a) => a.status === "pending" || a.status === "under_review").length || 0,
    approved: applications?.filter((a) => a.status === "approved").length || 0,
    paid: applications?.filter((a) => a.status === "paid").length || 0,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-welcome">
                {getGreeting()}, {user?.firstName || "there"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your assistance applications and track their status
              </p>
            </div>
            <Link href="/apply">
              <Button className="gap-2" data-testid="button-new-application">
                <Plus className="h-4 w-4" />
                New Application
              </Button>
            </Link>
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
                <div className="text-3xl font-bold" data-testid="stat-total">
                  {applicationsLoading ? <Skeleton className="h-9 w-12" /> : stats.total}
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
                <div className="text-3xl font-bold" data-testid="stat-pending">
                  {applicationsLoading ? <Skeleton className="h-9 w-12" /> : stats.pending}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="stat-approved">
                  {applicationsLoading ? <Skeleton className="h-9 w-12" /> : stats.approved}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Payments Received
                </CardTitle>
                <Banknote className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="stat-paid">
                  {applicationsLoading ? <Skeleton className="h-9 w-12" /> : stats.paid}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Completion Alert */}
          <Card className="mb-8 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <User className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium">Complete Your Profile</p>
                  <p className="text-sm text-muted-foreground">
                    Add your personal details and bank information to speed up applications
                  </p>
                </div>
              </div>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-complete-profile">
                  Complete Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Applications Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Applications</h2>
              {applications && applications.length > 0 && (
                <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all">
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {applicationsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {applications.map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Applications Yet</h3>
                    <p className="text-muted-foreground mt-1">
                      Start your first application to request financial assistance
                    </p>
                  </div>
                  <Link href="/apply">
                    <Button className="gap-2 mt-4" data-testid="button-first-application">
                      <Plus className="h-4 w-4" />
                      Create Your First Application
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
