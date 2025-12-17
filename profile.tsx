import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Lock,
  Mail,
  Globe,
} from "lucide-react";
import type { UserProfile, BankDetails } from "@shared/schema";

const profileSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().optional(),
  country: z.enum(["UK", "USA"]),
  address: z.string().optional(),
});

const bankDetailsSchema = z.object({
  country: z.enum(["UK", "USA"]),
  bankName: z.string().min(2, "Please select your bank"),
  accountNumber: z.string().min(6, "Please enter a valid account number"),
  sortCode: z.string().optional(),
  routingNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

const UK_BANKS = [
  "Barclays", "HSBC", "Lloyds Bank", "NatWest", "Santander UK",
  "Halifax", "TSB", "Nationwide", "Co-operative Bank", "Metro Bank",
  "Monzo", "Starling Bank", "Revolut",
];

const US_BANKS = [
  "Chase", "Bank of America", "Wells Fargo", "Citibank", "U.S. Bank",
  "PNC Bank", "Capital One", "TD Bank", "BB&T", "SunTrust",
];

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: bankDetailsList, isLoading: bankLoading } = useQuery<BankDetails[]>({
    queryKey: ["/api/bank-details"],
    enabled: !!user,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      country: "UK",
      address: "",
    },
    values: profile ? {
      fullName: profile.fullName,
      phone: profile.phone || "",
      country: profile.country as "UK" | "USA",
      address: profile.address || "",
    } : undefined,
  });

  const bankForm = useForm<BankDetailsFormData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      country: "UK",
      bankName: "",
      accountNumber: "",
      sortCode: "",
      routingNumber: "",
    },
  });

  const selectedCountry = bankForm.watch("country");
  const banks = selectedCountry === "UK" ? UK_BANKS : US_BANKS;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const addBankDetailsMutation = useMutation({
    mutationFn: async (data: BankDetailsFormData & { accountHolderName?: string }) => {
      return await apiRequest("POST", "/api/bank-details", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-details"] });
      toast({
        title: "Bank Account Added",
        description: "Your bank account has been added successfully.",
      });
      setIsAddingBank(false);
      setVerifiedName(null);
      bankForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Bank",
        description: error.message || "Failed to add bank account.",
        variant: "destructive",
      });
    },
  });

  const deleteBankDetailsMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/bank-details/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-details"] });
      toast({
        title: "Bank Account Removed",
        description: "Your bank account has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove",
        description: error.message || "Failed to remove bank account.",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleVerifyBank = async () => {
    const isValid = await bankForm.trigger();
    if (!isValid) return;

    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const mockNames = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis"];
    setVerifiedName(mockNames[Math.floor(Math.random() * mockNames.length)]);
    setIsVerifying(false);
  };

  const handleAddBank = () => {
    const data = bankForm.getValues();
    addBankDetailsMutation.mutate({
      ...data,
      accountHolderName: verifiedName || undefined,
    });
  };

  const getInitials = () => {
    if (profile?.fullName) {
      const names = profile.fullName.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return profile.fullName[0].toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return "U";
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-64" />
              <div className="md:col-span-2">
                <Skeleton className="h-96" />
              </div>
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8" data-testid="text-profile-title">
            Your Profile
          </h1>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Summary Card */}
            <Card>
              <CardContent className="pt-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold" data-testid="text-profile-name">
                  {profile?.fullName || user?.firstName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-profile-email">
                  {user?.email}
                </p>
                <div className="mt-4 flex justify-center">
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    {profile?.country || "UK"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Legal Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Smith"
                                data-testid="input-full-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="+44 7123 456789"
                                    className="pl-10"
                                    data-testid="input-phone"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-profile-country">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UK">United Kingdom</SelectItem>
                                  <SelectItem value="USA">United States</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your full address..."
                                className="resize-none"
                                data-testid="input-address"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This helps us verify your location for aid eligibility
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Bank Accounts
                      </CardTitle>
                      <CardDescription>
                        Manage your bank accounts for receiving aid
                      </CardDescription>
                    </div>
                    {!isAddingBank && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingBank(true)}
                        className="gap-1"
                        data-testid="button-add-bank"
                      >
                        <Plus className="h-4 w-4" />
                        Add Account
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bankLoading ? (
                    <Skeleton className="h-20" />
                  ) : bankDetailsList && bankDetailsList.length > 0 ? (
                    <div className="space-y-3">
                      {bankDetailsList.map((bank) => (
                        <div
                          key={bank.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                          data-testid={`card-bank-${bank.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{bank.bankName}</p>
                              <p className="text-sm text-muted-foreground">
                                ****{bank.accountNumber.slice(-4)}
                                {bank.accountHolderName && ` - ${bank.accountHolderName}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {bank.isVerified === "verified" ? (
                              <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            ) : bank.isVerified === "pending" ? (
                              <Badge variant="outline" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Pending
                              </Badge>
                            ) : null}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  data-testid={`button-delete-bank-${bank.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Bank Account?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the bank account from your profile. You can add it again later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteBankDetailsMutation.mutate(bank.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !isAddingBank ? (
                    <div className="text-center py-6">
                      <Building2 className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No bank accounts added yet</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingBank(true)}
                        className="mt-4 gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Your First Account
                      </Button>
                    </div>
                  ) : null}

                  {isAddingBank && (
                    <div className="rounded-lg border p-4 space-y-4">
                      <h4 className="font-medium">Add New Bank Account</h4>
                      <Form {...bankForm}>
                        <form className="space-y-4">
                          <FormField
                            control={bankForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-bank-country">
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="USA">United States</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={bankForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-bank-name">
                                      <SelectValue placeholder="Select your bank" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {banks.map((bank) => (
                                      <SelectItem key={bank} value={bank}>
                                        {bank}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={bankForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={selectedCountry === "UK" ? "12345678" : "1234567890123"}
                                    data-testid="input-new-account-number"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {selectedCountry === "UK" ? (
                            <FormField
                              control={bankForm.control}
                              name="sortCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sort Code *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="12-34-56"
                                      data-testid="input-new-sort-code"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : (
                            <FormField
                              control={bankForm.control}
                              name="routingNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Routing Number *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="123456789"
                                      data-testid="input-new-routing-number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {verifiedName && (
                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                  Account Holder: {verifiedName}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span>Your bank details are encrypted and secure</span>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAddingBank(false);
                                setVerifiedName(null);
                                bankForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            {!verifiedName && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleVerifyBank}
                                disabled={isVerifying}
                                data-testid="button-verify-new-bank"
                              >
                                {isVerifying ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Verifying...
                                  </>
                                ) : (
                                  "Verify Account"
                                )}
                              </Button>
                            )}
                            <Button
                              type="button"
                              onClick={handleAddBank}
                              disabled={addBankDetailsMutation.isPending}
                              data-testid="button-save-bank"
                            >
                              {addBankDetailsMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Adding...
                                </>
                              ) : (
                                "Add Account"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
