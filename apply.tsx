import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  FileText,
  Banknote,
  Building2,
  Lock,
  Upload,
} from "lucide-react";
import type { BankDetails } from "@shared/schema";

const applicationSchema = z.object({
  reason: z.string().min(20, "Please provide at least 20 characters explaining your situation"),
  amountRequested: z.string().min(1, "Please enter an amount").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Please enter a valid positive amount"
  ),
  currency: z.enum(["GBP", "USD"]),
});

const bankDetailsSchema = z.object({
  country: z.enum(["UK", "USA"]),
  bankName: z.string().min(2, "Please select or enter your bank name"),
  accountNumber: z.string().min(6, "Please enter a valid account number"),
  sortCode: z.string().optional(),
  routingNumber: z.string().optional(),
}).refine(
  (data) => {
    if (data.country === "UK") return data.sortCode && data.sortCode.length >= 6;
    if (data.country === "USA") return data.routingNumber && data.routingNumber.length >= 9;
    return true;
  },
  {
    message: "Please provide the required bank routing information",
    path: ["sortCode"],
  }
);

type ApplicationFormData = z.infer<typeof applicationSchema>;
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

export default function Apply() {
  const [step, setStep] = useState(1);
  const [applicationData, setApplicationData] = useState<ApplicationFormData | null>(null);
  const [verifiedAccountName, setVerifiedAccountName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: existingBankDetails } = useQuery<BankDetails[]>({
    queryKey: ["/api/bank-details"],
    enabled: !!user,
  });

  const applicationForm = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      reason: "",
      amountRequested: "",
      currency: "GBP",
    },
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

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: { application: ApplicationFormData; bankDetails?: BankDetailsFormData }) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully. We'll review it shortly.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplicationSubmit = (data: ApplicationFormData) => {
    setApplicationData(data);
    setStep(2);
  };

  const handleBankVerify = async () => {
    const isValid = await bankForm.trigger();
    if (!isValid) return;

    setIsVerifying(true);
    
    // Simulate bank verification API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock verified account holder name
    const mockNames = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis"];
    setVerifiedAccountName(mockNames[Math.floor(Math.random() * mockNames.length)]);
    setIsVerifying(false);
    
    toast({
      title: "Bank Account Verified",
      description: "Your bank account has been successfully verified.",
    });
  };

  const handleFinalSubmit = () => {
    if (!applicationData) return;

    const bankDetailsData = bankForm.getValues();
    submitApplicationMutation.mutate({
      application: applicationData,
      bankDetails: verifiedAccountName ? bankDetailsData : undefined,
    });
  };

  const useExistingBankDetails = (details: BankDetails) => {
    setVerifiedAccountName(details.accountHolderName || "Verified Account");
    bankForm.setValue("country", details.country as "UK" | "USA");
    bankForm.setValue("bankName", details.bankName);
    bankForm.setValue("accountNumber", details.accountNumber);
    if (details.sortCode) bankForm.setValue("sortCode", details.sortCode);
    if (details.routingNumber) bankForm.setValue("routingNumber", details.routingNumber);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {step > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
                </div>
                <span className="hidden sm:inline font-medium">Request Details</span>
              </div>
              <div className="w-12 h-0.5 bg-muted">
                <div className={`h-full transition-all duration-300 ${step >= 2 ? "bg-primary w-full" : "w-0"}`} />
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {step > 2 ? <CheckCircle className="h-4 w-4" /> : "2"}
                </div>
                <span className="hidden sm:inline font-medium">Bank Details</span>
              </div>
              <div className="w-12 h-0.5 bg-muted">
                <div className={`h-full transition-all duration-300 ${step >= 3 ? "bg-primary w-full" : "w-0"}`} />
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  3
                </div>
                <span className="hidden sm:inline font-medium">Review</span>
              </div>
            </div>
          </div>

          {/* Step 1: Application Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Request Details
                </CardTitle>
                <CardDescription>
                  Tell us about your situation and the assistance you need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...applicationForm}>
                  <form onSubmit={applicationForm.handleSubmit(handleApplicationSubmit)} className="space-y-6">
                    <FormField
                      control={applicationForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Assistance *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please describe your current situation and why you need financial assistance..."
                              className="min-h-32 resize-none"
                              data-testid="input-reason"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Be as detailed as possible to help us understand your needs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={applicationForm.control}
                        name="amountRequested"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount Requested *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-10"
                                  data-testid="input-amount"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={applicationForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-currency">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Supporting Documents (Optional)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload any documents that support your request (bills, letters, etc.)
                      </p>
                      <Button variant="outline" size="sm" className="mt-4" type="button" data-testid="button-upload">
                        Select Files
                      </Button>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="gap-2" data-testid="button-next-step">
                        Continue to Bank Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Bank Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Bank Details
                </CardTitle>
                <CardDescription>
                  Add your bank account for receiving funds. We use secure Open Banking verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {existingBankDetails && existingBankDetails.length > 0 && (
                  <div className="space-y-3">
                    <Label>Use Existing Bank Account</Label>
                    <div className="grid gap-3">
                      {existingBankDetails.map((details) => (
                        <Card
                          key={details.id}
                          className="cursor-pointer hover-elevate"
                          onClick={() => useExistingBankDetails(details)}
                          data-testid={`card-existing-bank-${details.id}`}
                        >
                          <CardContent className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{details.bankName}</p>
                                <p className="text-sm text-muted-foreground">
                                  ****{details.accountNumber.slice(-4)}
                                </p>
                              </div>
                            </div>
                            {details.isVerified === "verified" && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or add new account
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Form {...bankForm}>
                  <form className="space-y-6">
                    <FormField
                      control={bankForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
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
                              <SelectTrigger data-testid="select-bank">
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
                              data-testid="input-account-number"
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
                                data-testid="input-sort-code"
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
                                data-testid="input-routing-number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {verifiedAccountName && (
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">
                              Account Verified
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-400">
                              Account Holder: {verifiedAccountName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Your bank details are encrypted and secure</span>
                    </div>
                  </form>
                </Form>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="gap-2"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-3">
                    {!verifiedAccountName && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBankVerify}
                        disabled={isVerifying}
                        className="gap-2"
                        data-testid="button-verify-bank"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Verify Account
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={() => setStep(3)}
                      className="gap-2"
                      data-testid="button-continue-review"
                    >
                      Continue to Review
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && applicationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Review Your Application
                </CardTitle>
                <CardDescription>
                  Please review your information before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Reason for Assistance</Label>
                    <p className="mt-1" data-testid="review-reason">{applicationData.reason}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Amount Requested</Label>
                      <p className="mt-1 text-lg font-semibold" data-testid="review-amount">
                        {applicationData.currency === "GBP" ? "£" : "$"}
                        {parseFloat(applicationData.amountRequested).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Currency</Label>
                      <p className="mt-1" data-testid="review-currency">{applicationData.currency}</p>
                    </div>
                  </div>

                  {verifiedAccountName && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <Label className="text-muted-foreground">Bank Account</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{bankForm.getValues("bankName")}</p>
                          <p className="text-sm text-muted-foreground">
                            Account Holder: {verifiedAccountName}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                  <p className="text-sm">
                    By submitting this application, you confirm that all information provided is accurate
                    and you agree to our terms and conditions.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="gap-2"
                    data-testid="button-back-to-bank"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={submitApplicationMutation.isPending}
                    className="gap-2"
                    data-testid="button-submit-application"
                  >
                    {submitApplicationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
