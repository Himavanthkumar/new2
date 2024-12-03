const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 hover:line-clamp-none">
          {post.title}
        </h2>
        <p className="text-gray-600 line-clamp-3 hover:line-clamp-none mb-4">
          {post.body}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Post ID: {post.id}</span>
          <span>User ID: {post.userId}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
