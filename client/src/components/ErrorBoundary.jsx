import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Here you can send to error logging service like Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Something went wrong</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            We're sorry for the inconvenience. Please refresh the page to try again.
          </p>
          {this.state.error && (
            <details className="mb-6 max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
