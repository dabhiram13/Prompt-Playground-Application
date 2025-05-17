export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-5">
      <h1 className="text-3xl font-bold mb-4">404</h1>
      <p className="text-lg mb-6">Page not found</p>
      <a 
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Go back home
      </a>
    </div>
  );
}