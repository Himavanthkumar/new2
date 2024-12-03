import axios from "axios";
import { cacheService } from "./cacheService.js";

const axiosInstance = axios.create({
  timeout: 15000, // 15 seconds
  headers: {
    "Content-Type": "application/json"
  }
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error("Axios error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export const prefetchAndCacheData = async () => {
  try {
    console.log("Starting data prefetch...");

    // Add retry logic
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
        console.log(`Retrying fetch... ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    }

    if (!response?.data) {
      throw new Error("No data received from API");
    }

    const posts = response.data;

    // Calculate how many pages we'll need with 9 posts per page
    const postsPerPage = 9;
    const totalPages = Math.ceil(posts.length / postsPerPage);

    // Cache each page of data
    for (let page = 1; page <= totalPages; page++) {
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const pageData = posts.slice(startIndex, endIndex);

      const cacheKey = `posts:${page}:${postsPerPage}`;
      await cacheService.set(cacheKey, pageData);
      console.log(`Cached page ${page}/${totalPages}`);
    }

    // Cache the total count
    await cacheService.set("posts:total", posts.length);
    console.log("Data prefetch completed successfully");
    return true;
  } catch (error) {
    console.error("Failed to prefetch data:", {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });

    // If we have cached data, we can still start the server
    const cachedTotal = await cacheService.get("posts:total");
    if (cachedTotal) {
      console.log("Using existing cached data...");
      return true;
    }

    return false;
  }
};
