import PostList from "./components/PostList";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        </div>
      </header>
      <PostList />
    </div>
  );
};

export default App;
