import cors from "cors";

export const corsMiddleware = cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL || false
    : ["http://localhost:5000", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});
