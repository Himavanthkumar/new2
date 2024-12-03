import express from "express";
import { getPosts } from "../controllers/postController.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { errorHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", cacheMiddleware(3600), getPosts);

// Apply error handler
router.use(errorHandler);

export default router;
