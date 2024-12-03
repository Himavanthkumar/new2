import { useState, useEffect, useCallback } from "react";

export const usePost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      if (posts.length === 0) {
        fetchPosts();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setError("You are offline. Showing cached content.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchPosts = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3000/api/posts?page=${page}&limit=9`,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const { data, pagination, fromCache, stale } = await response.json();

      setPosts(prevPosts => {
        // Create a new Set of existing post IDs
        const existingIds = new Set(prevPosts.map(p => p.id));
        // Filter out duplicates from new data
        const newPosts = data.filter(post => !existingIds.has(post.id));
        return [...prevPosts, ...newPosts];
      });

      setHasMore(pagination?.hasMore ?? data.length >= 9);

      if (stale || fromCache) {
        console.log("Serving cached data");
      }

      setRetryCount(0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch posts. Showing cached data if available.");

      if (retryCount < maxRetries && navigator.onLine) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchPosts();
        }, Math.min(1000 * Math.pow(2, retryCount), 10000));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setRetryCount(0);
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    isOffline,
    refresh
  };
};
