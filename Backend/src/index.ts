import "dotenv/config";
import mongoose from "mongoose";
import { LoggerContainer } from "./infrastructure/DI/LoggerContainer";
import app from "./app";


const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/connect";

// Get logger service from container
const loggerContainer = LoggerContainer.getInstance();
const loggerService = loggerContainer.getLoggerService();

// Connect to MongoDB, then start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    loggerService.info("MongoDB connected successfully");

    app.listen(PORT, () => {
      loggerService.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    loggerService.error("MongoDB connection failed", { error: error.message });
    process.exit(1);
  });

