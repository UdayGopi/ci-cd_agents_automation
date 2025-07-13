import { 
  users, pipelines, builds, deployments, agents,
  type User, type InsertUser, type Pipeline, type InsertPipeline,
  type Build, type InsertBuild, type Deployment, type InsertDeployment,
  type Agent, type InsertAgent
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface definition
interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Pipeline management
  getPipelines(): Promise<Pipeline[]>;
  getPipeline(id: number): Promise<Pipeline | undefined>;
  createPipeline(insertPipeline: InsertPipeline): Promise<Pipeline>;
  
  // Build management
  getBuilds(): Promise<Build[]>;
  getBuild(id: number): Promise<Build | undefined>;
  createBuild(insertBuild: InsertBuild): Promise<Build>;
  
  // Deployment management
  getDeployments(): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  createDeployment(insertDeployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: number, update: Partial<InsertDeployment>): Promise<Deployment>;
  
  // Agent management
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(insertAgent: InsertAgent): Promise<Agent>;
  
  // Pipeline execution management
  createPipelineExecution(data: { pipelineId: number; status: string }): Promise<{ id: string }>;
  getPipelineExecution(id: string): Promise<{ id: string; status: string; pipeline: Pipeline }>;
  
  // Cost management
  getHistoricalCosts(): Promise<{ date: Date; cost: number }[]>;
  
  // Statistics
  getStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Pipeline management
  async getPipelines(): Promise<Pipeline[]> {
    return await db.select().from(pipelines);
  }

  async getPipeline(id: number): Promise<Pipeline | undefined> {
    const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.id, id));
    return pipeline || undefined;
  }

  async createPipeline(insertPipeline: InsertPipeline): Promise<Pipeline> {
    const [pipeline] = await db
      .insert(pipelines)
      .values(insertPipeline)
      .returning();
    return pipeline;
  }

  // Build management
  async getBuilds(): Promise<Build[]> {
    return await db.select().from(builds);
  }

  async getBuild(id: number): Promise<Build | undefined> {
    const [build] = await db.select().from(builds).where(eq(builds.id, id));
    return build || undefined;
  }

  async createBuild(insertBuild: InsertBuild): Promise<Build> {
    const [build] = await db
      .insert(builds)
      .values(insertBuild)
      .returning();
    return build;
  }

  // Deployment management
  async getDeployments(): Promise<Deployment[]> {
    return await db.select().from(deployments);
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment || undefined;
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const [deployment] = await db
      .insert(deployments)
      .values(insertDeployment)
      .returning();
    return deployment;
  }

  async updateDeployment(id: number, update: Partial<InsertDeployment>): Promise<Deployment> {
    const [deployment] = await db
      .update(deployments)
      .set(update)
      .where(eq(deployments.id, id))
      .returning();
    return deployment;
  }

  // Agent management
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db
      .insert(agents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  // Pipeline execution management
  async createPipelineExecution(data: { pipelineId: number; status: string }): Promise<{ id: string }> {
    const [execution] = await db
      .insert(builds)
      .values({
        pipelineId: data.pipelineId,
        status: data.status,
        buildNumber: 1, // You might want to implement auto-incrementing build numbers
        startTime: new Date(),
      })
      .returning();
    return { id: execution.id.toString() };
  }

  async getPipelineExecution(id: string): Promise<{ id: string; status: string; pipeline: Pipeline }> {
    const [execution] = await db
      .select()
      .from(builds)
      .where(eq(builds.id, parseInt(id)))
      .leftJoin(pipelines, eq(builds.pipelineId, pipelines.id));
    
    if (!execution) throw new Error('Execution not found');
    
    return {
      id: execution.builds.id.toString(),
      status: execution.builds.status,
      pipeline: execution.pipelines
    };
  }

  // Cost management
  async getHistoricalCosts(): Promise<{ date: Date; cost: number }[]> {
    // This is a placeholder implementation. You should implement proper cost tracking
    const deployments = await this.getDeployments();
    const costs = deployments.map(d => ({
      date: d.deployedAt || new Date(),
      cost: Math.random() * 100 // Placeholder cost calculation
    }));
    return costs;
  }

  // Statistics
  async getStats(): Promise<any> {
    const pipelineCount = await db.select().from(pipelines);
    const buildCount = await db.select().from(builds);
    const deploymentCount = await db.select().from(deployments);
    const agentCount = await db.select().from(agents);

    return {
      totalPipelines: pipelineCount.length,
      totalBuilds: buildCount.length,
      totalDeployments: deploymentCount.length,
      totalAgents: agentCount.length,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const storage = new DatabaseStorage();