import "dotenv/config";
import express from "express";
import cors from "cors";
import postRoutes from "./routes/postRoutes.js";
import { prefetchAndCacheData } from "./services/prefetchService.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// Routes
app.use("/api/posts", postRoutes);

// Prefetch data when server starts
const startServer = async () => {
  try {
    // Attempt to prefetch data
    const prefetchSuccess = await prefetchAndCacheData();

    if (!prefetchSuccess) {
      console.warn(
        "Server starting without initial cache. Will attempt to fetch data on requests."
      );
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
