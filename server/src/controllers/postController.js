import axios from "axios";
import { cacheService } from "../services/cacheService.js";

const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json"
  }
});

export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const cacheKey = `posts:${page}:${limit}`;

  try {
    // Always try to get data from cache first
    const cachedData = await cacheService.get(cacheKey);
    const totalPosts = await cacheService.get("posts:total");

    if (cachedData) {
      return res.json({
        data: cachedData,
        pagination: {
          currentPage: page,
          limit,
          totalPosts: totalPosts || cachedData.length,
          hasMore: page * limit < totalPosts
        },
        fromCache: true
      });
    }

    // If not in cache, fetch from API with retry logic
    let retries = 3;
    let response;

    while (retries > 0) {
      try {
        response = await axiosInstance.get(
          "https://jsonplaceholder.typicode.com/posts"
        );
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

    if (!response?.data) {
      throw new Error("No data received from API");
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = response.data.slice(startIndex, endIndex);

    // Cache the data and total count
    await cacheService.set(cacheKey, paginatedData);
    await cacheService.set("posts:total", response.data.length);

    res.json({
      data: paginatedData,
      pagination: {
        currentPage: page,
        limit,
        totalPosts: response.data.length,
        hasMore: endIndex < response.data.length
      },
      fromCache: false
    });
  } catch (error) {
    console.error("Error in getPosts:", {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });

    // If error occurs, try to serve cached data
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        data: cachedData,
        fromCache: true,
        stale: true
      });
    }

    res.status(500).json({
      error: "Failed to fetch posts",
      message: error.message
    });
  }
};
