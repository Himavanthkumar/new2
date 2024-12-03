import { cacheService } from "../services/cacheService.js";

export const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey = `posts:${req.query.page || 1}:${req.query.limit || 9}`;
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        return res.json({
          fromCache: true,
          data: cachedData
        });
      }

      // Attach cache service to response object for controller use
      res.locals.cache = {
        key: cacheKey,
        ttl,
        service: cacheService
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
