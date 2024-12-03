import { usePost } from "../hooks/usePost";
import PostCard from "./PostCard";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

const PostList = () => {
  const {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    isOffline,
    refresh
  } = usePost();
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px"
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {isOffline && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            You are currently offline. Showing cached content.
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-red-200 rounded hover:bg-red-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}

        {/* Sentinel element for infinite scroll */}
        {hasMore && <div ref={ref} className="h-20 w-full" />}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-gray-600">
            No more posts to load
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
