import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";
import { users } from "./models/auth";

// Enums
export const applicationStatusEnum = pgEnum("application_status", ["pending", "under_review", "approved", "rejected", "paid"]);
export const countryEnum = pgEnum("country", ["UK", "USA"]);
export const userRoleEnum = pgEnum("user_role", ["beneficiary", "admin"]);

// User profiles (extends auth users with additional charity-specific data)
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name").notNull(),
  phone: varchar("phone"),
  country: countryEnum("country").notNull().default("UK"),
  address: text("address"),
  role: userRoleEnum("role").notNull().default("beneficiary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bank details
export const bankDetails = pgTable("bank_details", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  country: countryEnum("country").notNull(),
  bankName: varchar("bank_name").notNull(),
  accountNumber: varchar("account_number").notNull(),
  sortCode: varchar("sort_code"), // UK
  routingNumber: varchar("routing_number"), // USA
  accountHolderName: varchar("account_holder_name"),
  isVerified: text("is_verified").notNull().default("pending"), // pending, verified, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Aid applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bankDetailsId: varchar("bank_details_id").references(() => bankDetails.id),
  reason: text("reason").notNull(),
  amountRequested: decimal("amount_requested", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("GBP"),
  supportingDocuments: text("supporting_documents").array(),
  status: applicationStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  paidAt: timestamp("paid_at"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const bankDetailsRelations = relations(bankDetails, ({ one }) => ({
  user: one(users, {
    fields: [bankDetails.userId],
    references: [users.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  bankDetails: one(bankDetails, {
    fields: [applications.bankDetailsId],
    references: [bankDetails.id],
  }),
  reviewer: one(users, {
    fields: [applications.reviewedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankDetailsSchema = createInsertSchema(bankDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  accountHolderName: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  paidAt: true,
  paidAmount: true,
});

// Types
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertBankDetails = z.infer<typeof insertBankDetailsSchema>;
export type BankDetails = typeof bankDetails.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
