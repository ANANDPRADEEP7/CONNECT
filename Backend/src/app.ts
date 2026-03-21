import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import authRoutes from "./presentation/routes/Auth/auth.routes";
import userRoutes from "./presentation/routes/User/user.routes";
import adminRoutes from "./presentation/routes/Admin/admin.routes";
import { LoggerContainer } from "./infrastructure/DI/LoggerContainer";
import { errorLogger, requestLogger } from "./presentation/middleware/LoggerMiddleware";

const app = express();
app.use(cookieParser());

// Get logger service from container
const loggerContainer = LoggerContainer.getInstance();
const loggerService = loggerContainer.getLoggerService();

// HTTP request logging middleware
app.use(requestLogger);

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
// Files saved to /uploads/ are accessible at: http://localhost:3000/uploads/<filename>
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/user/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// Error handling middleware
app.use(errorLogger);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  loggerService.warn(`404 - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(404).json({
    error: {
      message: "Route not found",
    },
  });
});

export default app;
