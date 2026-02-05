import React from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-content/5">
            <div className="card-body items-center text-center p-8 sm:p-12">
              <div className="mb-6 p-4 rounded-full bg-error/10 text-error animate-pulse">
                <AlertTriangle className="w-12 h-12" />
              </div>

              <h2 className="card-title text-3xl font-bold mb-2 text-base-content">
                System Malfunction
              </h2>
              <p className="text-base-content/60 mb-8 max-w-sm">
                We've encountered an unexpected error. Don't worry, your data is
                safe. Please try reloading the page.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  className="btn btn-primary btn-lg gap-3 shadow-lg hover:shadow-primary/20"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Application
                </button>
                <button
                  className="btn btn-ghost btn-lg gap-3"
                  onClick={() => (window.location.href = "/")}
                >
                  <Home className="w-5 h-5" />
                  Return Home
                </button>
              </div>

              {import.meta.env.DEV && (
                <div className="mt-8 collapse collapse-arrow bg-base-200 rounded-xl text-left border border-base-content/5 w-full">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium text-xs uppercase tracking-wider opacity-50">
                    View Error Details (Dev Mode)
                  </div>
                  <div className="collapse-content">
                    <pre className="text-xs font-mono text-error/80 overflow-x-auto p-2">
                      {this.state.error?.stack || this.state.error?.toString()}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
