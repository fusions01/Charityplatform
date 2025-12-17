import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";

// Validation schemas
const profileSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional().nullable(),
  country: z.enum(["UK", "USA"]),
  address: z.string().optional().nullable(),
});

const bankDetailsSchema = z.object({
  country: z.enum(["UK", "USA"]),
  bankName: z.string().min(2),
  accountNumber: z.string().min(6),
  sortCode: z.string().optional().nullable(),
  routingNumber: z.string().optional().nullable(),
  accountHolderName: z.string().optional().nullable(),
});

const applicationSchema = z.object({
  reason: z.string().min(20),
  amountRequested: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0),
  currency: z.enum(["GBP", "USD"]),
  bankDetailsId: z.string().optional().nullable(),
});

const applicationSubmitSchema = z.object({
  application: applicationSchema,
  bankDetails: bankDetailsSchema.optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(["pending", "under_review", "approved", "rejected", "paid"]).optional(),
  adminNotes: z.string().optional().nullable(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = profileSchema.parse(req.body);
      
      let profile = await storage.getProfile(userId);
      
      if (profile) {
        profile = await storage.updateProfile(userId, data);
      } else {
        profile = await storage.createProfile({ ...data, userId });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Bank details routes
  app.get("/api/bank-details", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const details = await storage.getBankDetails(userId);
      res.json(details);
    } catch (error) {
      console.error("Error fetching bank details:", error);
      res.status(500).json({ message: "Failed to fetch bank details" });
    }
  });

  app.post("/api/bank-details", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = bankDetailsSchema.parse(req.body);
      
      const details = await storage.createBankDetails({
        userId,
        country: data.country,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        sortCode: data.sortCode,
        routingNumber: data.routingNumber,
        accountHolderName: data.accountHolderName,
      });
      
      res.json(details);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating bank details:", error);
      res.status(500).json({ message: "Failed to create bank details" });
    }
  });

  app.delete("/api/bank-details/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const existing = await storage.getBankDetailsById(id);
      if (!existing) {
        return res.status(404).json({ message: "Bank details not found" });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteBankDetails(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bank details:", error);
      res.status(500).json({ message: "Failed to delete bank details" });
    }
  });

  // Application routes
  app.get("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const application = await storage.getApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { application: appData, bankDetails: bankData } = applicationSubmitSchema.parse(req.body);
      
      let bankDetailsId: string | null = null;
      
      // Create bank details if provided
      if (bankData) {
        const details = await storage.createBankDetails({
          userId,
          country: bankData.country,
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          sortCode: bankData.sortCode,
          routingNumber: bankData.routingNumber,
          accountHolderName: bankData.accountHolderName,
        });
        bankDetailsId = details.id;
      } else if (appData.bankDetailsId) {
        // Verify ownership of existing bank details
        const existing = await storage.getBankDetailsById(appData.bankDetailsId);
        if (!existing || existing.userId !== userId) {
          return res.status(403).json({ message: "Invalid bank details" });
        }
        bankDetailsId = appData.bankDetailsId;
      }
      
      // Create application with userId from session
      const application = await storage.createApplication({
        userId,
        reason: appData.reason,
        amountRequested: appData.amountRequested,
        currency: appData.currency,
        bankDetailsId,
      });
      
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Admin routes
  app.get("/api/admin/applications", isAuthenticated, async (req: any, res) => {
    try {
      // In a production app, you would check if user has admin role here
      const applications = await storage.getAllApplicationsWithDetails();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching all applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch("/api/admin/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const { id } = req.params;
      const { status, adminNotes } = updateApplicationSchema.parse(req.body);
      
      // In a production app, verify admin role here
      
      const existingApp = await storage.getApplicationById(id);
      if (!existingApp) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const updateData: any = {
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      };
      
      if (status) updateData.status = status;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      
      if (status === "paid") {
        updateData.paidAt = new Date();
        updateData.paidAmount = existingApp.amountRequested;
      }
      
      const application = await storage.updateApplication(id, updateData);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  return httpServer;
}
