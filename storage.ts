import {
  users,
  userProfiles,
  bankDetails,
  applications,
  type User,
  type UserProfile,
  type InsertUserProfile,
  type BankDetails,
  type InsertBankDetails,
  type Application,
  type InsertApplication,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User Profiles
  getProfile(userId: string): Promise<UserProfile | undefined>;
  createProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;

  // Bank Details
  getBankDetails(userId: string): Promise<BankDetails[]>;
  getBankDetailsById(id: string): Promise<BankDetails | undefined>;
  createBankDetails(data: {
    userId: string;
    country: "UK" | "USA";
    bankName: string;
    accountNumber: string;
    sortCode?: string | null;
    routingNumber?: string | null;
    accountHolderName?: string | null;
    isVerified?: string;
  }): Promise<BankDetails>;
  deleteBankDetails(id: string, userId: string): Promise<boolean>;

  // Applications
  getApplications(userId: string): Promise<Application[]>;
  getApplicationById(id: string): Promise<Application | undefined>;
  getAllApplicationsWithDetails(): Promise<(Application & { user?: User; bankDetails?: BankDetails })[]>;
  createApplication(data: {
    userId: string;
    reason: string;
    amountRequested: string;
    currency: string;
    bankDetailsId?: string | null;
    supportingDocuments?: string[] | null;
  }): Promise<Application>;
  updateApplication(id: string, data: Partial<Application>): Promise<Application | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User Profiles
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async updateProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    // Only update fields that are provided
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (profile.fullName !== undefined) updateData.fullName = profile.fullName;
    if (profile.phone !== undefined) updateData.phone = profile.phone;
    if (profile.country !== undefined) updateData.country = profile.country;
    if (profile.address !== undefined) updateData.address = profile.address;
    if (profile.role !== undefined) updateData.role = profile.role;

    const [updated] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Bank Details
  async getBankDetails(userId: string): Promise<BankDetails[]> {
    return await db.select().from(bankDetails).where(eq(bankDetails.userId, userId));
  }

  async getBankDetailsById(id: string): Promise<BankDetails | undefined> {
    const [details] = await db.select().from(bankDetails).where(eq(bankDetails.id, id));
    return details;
  }

  async createBankDetails(data: {
    userId: string;
    country: "UK" | "USA";
    bankName: string;
    accountNumber: string;
    sortCode?: string | null;
    routingNumber?: string | null;
    accountHolderName?: string | null;
    isVerified?: string;
  }): Promise<BankDetails> {
    const [created] = await db.insert(bankDetails).values({
      userId: data.userId,
      country: data.country,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      sortCode: data.sortCode || null,
      routingNumber: data.routingNumber || null,
      accountHolderName: data.accountHolderName || null,
      isVerified: data.accountHolderName ? "verified" : "pending",
    }).returning();
    return created;
  }

  async deleteBankDetails(id: string, userId: string): Promise<boolean> {
    await db
      .delete(bankDetails)
      .where(and(eq(bankDetails.id, id), eq(bankDetails.userId, userId)));
    return true;
  }

  // Applications
  async getApplications(userId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationById(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getAllApplicationsWithDetails(): Promise<(Application & { user?: User; bankDetails?: BankDetails })[]> {
    const allApplications = await db
      .select()
      .from(applications)
      .orderBy(desc(applications.createdAt));

    const results: (Application & { user?: User; bankDetails?: BankDetails })[] = [];

    for (const app of allApplications) {
      const [user] = await db.select().from(users).where(eq(users.id, app.userId));
      let bank: BankDetails | undefined;
      if (app.bankDetailsId) {
        const [bankResult] = await db.select().from(bankDetails).where(eq(bankDetails.id, app.bankDetailsId));
        bank = bankResult;
      }
      results.push({
        ...app,
        user: user || undefined,
        bankDetails: bank,
      });
    }

    return results;
  }

  async createApplication(data: {
    userId: string;
    reason: string;
    amountRequested: string;
    currency: string;
    bankDetailsId?: string | null;
    supportingDocuments?: string[] | null;
  }): Promise<Application> {
    const [created] = await db.insert(applications).values({
      userId: data.userId,
      reason: data.reason,
      amountRequested: data.amountRequested,
      currency: data.currency,
      bankDetailsId: data.bankDetailsId || null,
      supportingDocuments: data.supportingDocuments || null,
      status: "pending",
    }).returning();
    return created;
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application | undefined> {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes;
    if (data.reviewedBy !== undefined) updateData.reviewedBy = data.reviewedBy;
    if (data.reviewedAt !== undefined) updateData.reviewedAt = data.reviewedAt;
    if (data.paidAt !== undefined) updateData.paidAt = data.paidAt;
    if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;

    const [updated] = await db
      .update(applications)
      .set(updateData)
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
