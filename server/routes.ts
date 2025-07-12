import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { groqRoutes } from "./routes/groq";
import { aiAssistant } from "./agents/ai-assistant";
import rateLimit from "express-rate-limit";

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

      const user = await storage.createUser({ username, password });
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
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
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

  // GitHub webhook handler
  app.post("/api/webhooks/github", async (req, res) => {
    try {
      const signature = req.headers['x-hub-signature-256'];
      const event = req.headers['x-github-event'];
      
      // Verify webhook signature here
      // Process webhook event
      
      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            ws.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
            break;
          case 'ai-chat':
            const response = await aiAssistant.processMessage(data.message);
            ws.send(JSON.stringify({ type: 'ai-response', response }));
            break;
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
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
