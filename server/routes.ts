import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { groqRoutes } from "./routes/groq";
import { aiAssistant } from "./agents/ai-assistant";
import rateLimit from "express-rate-limit";
import session from "express-session";
import pgSession from "connect-pg-simple";
import bcrypt from "bcrypt";
import { eq, and } from "drizzle-orm";
import { pipelines, pipelineExecutions } from "./db/schema";
import { db } from "./db/client";
import { executePipeline, cancelPipelineExecution } from "./pipeline-executor";

// Extend session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

interface WebSocketWithAuth extends WebSocket {
  userId?: string;
}

const SALT_ROUNDS = 10;

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Session configuration
  app.use(
    session({
      store: new (pgSession(session))({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        tableName: "user_sessions",
      }),
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Apply rate limiting to API routes
  app.use("/api", apiLimiter);

  // User authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await storage.createUser({ 
        username, 
        password: hashedPassword 
      });
      
      // Set user session
      (req.session as any).userId = user.id;
      
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set user session
      (req.session as any).userId = user.id;

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Pipeline management routes
  app.get("/api/pipelines", async (req, res) => {
    try {
      const pipelines = await storage.getPipelines();
      res.json(pipelines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pipelines" });
    }
  });

  app.post("/api/pipelines", async (req, res) => {
    try {
      const pipeline = await storage.createPipeline(req.body);
      res.status(201).json(pipeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to create pipeline" });
    }
  });

  app.get("/api/pipelines/:id", async (req, res) => {
    try {
      const pipeline = await storage.getPipeline(parseInt(req.params.id));
      if (!pipeline) {
        return res.status(404).json({ message: "Pipeline not found" });
      }
      res.json(pipeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pipeline" });
    }
  });

  // Pipeline Execution Routes
  app.post('/api/pipelines/:id/execute', async (req, res) => {
    try {
      const { id } = req.params;
      const { branch, environment } = req.body;
      
      // Validate user has access to pipeline
      const pipeline = await db.query.pipelines.findFirst({
        where: eq(pipelines.id, id),
        with: {
          project: true
        }
      });

      if (!pipeline || pipeline.project.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Unauthorized access to pipeline' });
      }

      // Create execution record
      const execution = await db.insert(pipelineExecutions).values({
        pipelineId: id,
        status: 'pending',
        branch,
        environment,
        startedAt: new Date(),
        logs: '',
      }).returning();

      // Trigger async pipeline execution
      executePipeline(execution[0].id).catch(console.error);

      res.json({ executionId: execution[0].id });
    } catch (error) {
      console.error('Pipeline execution error:', error);
      res.status(500).json({ error: 'Failed to execute pipeline' });
    }
  });

  app.post('/api/pipelines/:id/cancel', async (req, res) => {
    try {
      const { id } = req.params;
      const { executionId } = req.body;

      const execution = await db.query.pipelineExecutions.findFirst({
        where: and(
          eq(pipelineExecutions.id, executionId),
          eq(pipelineExecutions.pipelineId, id)
        ),
        with: {
          pipeline: {
            with: {
              project: true
            }
          }
        }
      });

      if (!execution || execution.pipeline.project.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Unauthorized access to pipeline execution' });
      }

      await db.update(pipelineExecutions)
        .set({ status: 'cancelled', endedAt: new Date() })
        .where(eq(pipelineExecutions.id, executionId));

      // Cancel actual execution process
      await cancelPipelineExecution(executionId);

      res.json({ message: 'Pipeline execution cancelled' });
    } catch (error) {
      console.error('Pipeline cancellation error:', error);
      res.status(500).json({ error: 'Failed to cancel pipeline execution' });
    }
  });

  app.get('/api/pipelines/:id/logs', async (req, res) => {
    try {
      const { id } = req.params;
      const { executionId } = req.query;

      const execution = await db.query.pipelineExecutions.findFirst({
        where: and(
          eq(pipelineExecutions.id, executionId as string),
          eq(pipelineExecutions.pipelineId, id)
        ),
        with: {
          pipeline: {
            with: {
              project: true
            }
          }
        }
      });

      if (!execution || execution.pipeline.project.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Unauthorized access to pipeline logs' });
      }

      res.json({ logs: execution.logs });
    } catch (error) {
      console.error('Pipeline logs error:', error);
      res.status(500).json({ error: 'Failed to fetch pipeline logs' });
    }
  });

  app.get('/api/pipelines/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { executionId } = req.query;

      const execution = await db.query.pipelineExecutions.findFirst({
        where: and(
          eq(pipelineExecutions.id, executionId as string),
          eq(pipelineExecutions.pipelineId, id)
        ),
        with: {
          pipeline: {
            with: {
              project: true
            }
          }
        }
      });

      if (!execution || execution.pipeline.project.userId !== req.session.userId) {
        return res.status(403).json({ error: 'Unauthorized access to pipeline status' });
      }

      res.json({
        status: execution.status,
        startedAt: execution.startedAt,
        endedAt: execution.endedAt,
        duration: execution.endedAt ? 
          (new Date(execution.endedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000 : 
          null
      });
    } catch (error) {
      console.error('Pipeline status error:', error);
      res.status(500).json({ error: 'Failed to fetch pipeline status' });
    }
  });

  // Agent status routes
  app.get("/api/agents/status", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status" });
    }
  });

  // Build and deployment routes
  app.get("/api/builds", async (req, res) => {
    try {
      const builds = await storage.getBuilds();
      res.json(builds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch builds" });
    }
  });

  app.get("/api/deployments", async (req, res) => {
    try {
      const deployments = await storage.getDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deployments" });
    }
  });

  // Statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Groq AI routes
  app.use("/api/groq", groqRoutes);

  // Metrics endpoint
  app.get('/api/metrics', async (req, res) => {
    try {
      const { register } = await import('./monitoring/metrics');
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      console.error('Metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // GitHub webhook handler
  app.post("/api/webhooks/github", async (req, res) => {
    try {
      const signature = req.headers['x-hub-signature-256'];
      const event = req.headers['x-github-event'];
      const payload = req.body;
      
      // Verify webhook signature
      if (!signature || !process.env.GITHUB_WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Missing signature or webhook secret' });
      }

      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
      const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
      
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Process webhook event
      switch (event) {
        case 'push':
          // Handle push event
          const { ref, repository, commits } = payload;
          console.log(`Received push to ${ref} in ${repository.full_name}`);
          // Trigger pipeline if needed
          break;
        case 'pull_request':
          // Handle PR event
          const { action, pull_request } = payload;
          console.log(`Received PR ${action} event for ${pull_request.title}`);
          // Trigger PR pipeline if needed
          break;
        default:
          console.log(`Unhandled GitHub event: ${event}`);
      }
      
      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket authentication middleware
  const authenticateWsConnection = async (request: Request, socket: any, head: any) => {
    try {
      // Get session ID from cookie
      const cookies = request.headers.cookie;
      if (!cookies) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const sessionId = cookies
        .split(';')
        .find((cookie: string) => cookie.trim().startsWith('connect.sid='))
        ?.split('=')[1];

      if (!sessionId) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Verify session
      const sessionStore = new (pgSession(session))({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        tableName: "user_sessions",
      });

      const userSession = await new Promise((resolve, reject) => {
        sessionStore.get(sessionId, (err: any, session: any) => {
          if (err) reject(err);
          else resolve(session);
        });
      });

      if (!userSession || !(userSession as any).userId) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Store user ID in socket for later use
      socket.userId = (userSession as any).userId;
      
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    }
  };

  wss.on('connection', async (ws: WebSocketWithAuth, request: Request) => {
    try {
      // Ensure socket is authenticated
      if (!request.socket.userId) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      const userId = request.socket.userId;
      console.log(`WebSocket client connected: User ${userId}`);

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          // Handle different message types
          switch (data.type) {
            case 'subscribe':
              // Verify user has access to requested channel
              const canAccess = await storage.checkChannelAccess(userId, data.channel);
              if (!canAccess) {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: 'Unauthorized access to channel' 
                }));
                return;
              }
              ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
              break;
              
            case 'ai-chat':
              const response = await aiAssistant.processMessage(data.message, userId);
              ws.send(JSON.stringify({ type: 'ai-response', response }));
              break;
              
            default:
              ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to process message' 
          }));
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: User ${userId}`);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal Server Error');
    }
  });

  // Broadcast updates to all connected clients
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Store broadcast function for use in other modules
  (global as any).broadcast = broadcast;

  return httpServer;
}
