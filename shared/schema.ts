import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  repository: text("repository").notNull(),
  branch: text("branch").notNull(),
  status: text("status").notNull(),
  configuration: jsonb("configuration"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const builds = pgTable("builds", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").references(() => pipelines.id),
  buildNumber: integer("build_number").notNull(),
  status: text("status").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  logs: text("logs"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  buildId: integer("build_id").references(() => builds.id),
  pipelineId: integer("pipeline_id").references(() => pipelines.id),
  environment: text("environment").notNull(),
  status: text("status").notNull(),
  deployedAt: timestamp("deployed_at"),
  configuration: jsonb("configuration"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  lastHeartbeat: timestamp("last_heartbeat"),
  configuration: jsonb("configuration"),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  severity: text("severity").notNull(),
  pipelineId: integer("pipeline_id").references(() => pipelines.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pipelines: many(pipelines),
  notifications: many(notifications),
  aiInsights: many(aiInsights),
}));

export const pipelinesRelations = relations(pipelines, ({ one, many }) => ({
  user: one(users, { fields: [pipelines.userId], references: [users.id] }),
  builds: many(builds),
  deployments: many(deployments),
  aiInsights: many(aiInsights),
}));

export const buildsRelations = relations(builds, ({ one, many }) => ({
  pipeline: one(pipelines, { fields: [builds.pipelineId], references: [pipelines.id] }),
  deployments: many(deployments),
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  build: one(builds, { fields: [deployments.buildId], references: [builds.id] }),
  pipeline: one(pipelines, { fields: [deployments.pipelineId], references: [pipelines.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  pipeline: one(pipelines, { fields: [aiInsights.pipelineId], references: [pipelines.id] }),
  user: one(users, { fields: [aiInsights.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPipelineSchema = createInsertSchema(pipelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBuildSchema = createInsertSchema(builds).omit({
  id: true,
  createdAt: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAIInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Build = typeof builds.$inferSelect;
export type InsertBuild = z.infer<typeof insertBuildSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AIInsight = typeof aiInsights.$inferSelect;
export type InsertAIInsight = z.infer<typeof insertAIInsightSchema>;
