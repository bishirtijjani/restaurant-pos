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
            <div className="card-body items-center text-center p-4 sm:p-12">
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

              {/* Error Details Section for Support (Always visible in simplified form, expandable in Dev) */}
              <div className="mt-8 collapse collapse-arrow bg-base-200 rounded-xl text-left border border-base-content/5 w-full group overflow-hidden">
                <input type="checkbox" />
                <div className="collapse-title font-medium text-xs uppercase tracking-wider opacity-50 flex justify-between items-center pr-12">
                  <span>View Error Details (For Support)</span>
                </div>
                <div className="collapse-content px-4 pb-4">
                  <div className="flex justify-end mb-2 sticky top-0 bg-base-200 py-2 z-10">
                    <button
                      className="btn btn-xs btn-outline gap-1 bg-base-100"
                      onClick={() => {
                        const errorText = `Error: ${this.state.error?.toString()}\n\nStack:\n${this.state.error?.stack}`;
                        navigator.clipboard.writeText(errorText);
                        // Optional: You could add a temporary "Copied!" state here if converted to functional component or adding more state
                        alert("Error details copied to clipboard!");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Copy Error
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-error/80 whitespace-pre-wrap break-all p-2 bg-base-100 rounded-lg border border-base-content/5 overflow-y-auto max-h-60">
                    {this.state.error?.stack || this.state.error?.toString()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
