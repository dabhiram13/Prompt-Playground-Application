import { Switch, Route } from "wouter";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Fresh Start</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This is a clean project ready for new development.
        </p>
        
        <Switch>
          <Route path="/">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Home Page</h2>
              <p className="text-gray-600 dark:text-gray-300">
                The project has been reset and is ready for your instructions.
              </p>
            </div>
          </Route>
          
          <Route>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-500 mb-4">404 - Page Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The page you're looking for doesn't exist.
              </p>
              <a href="/" className="text-blue-500 hover:underline">Go back home</a>
            </div>
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default App;