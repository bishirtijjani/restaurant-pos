import React from "react";

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
        <div className="flex flex-col items-center justify-center h-screen bg-base-200 p-4">
          <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="card-title text-error text-2xl mb-4">
                Something went wrong
              </h2>
              <p className="text-base-content/70">
                The application encountered an unexpected error. This might be
                due to a temporary issue or a connection problem.
              </p>
              <div className="card-actions mt-6 flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Reload Application
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => (window.location.href = "/")}
                >
                  Go Home
                </button>
              </div>
              {import.meta.env.DEV && (
                <div className="mt-8 p-4 bg-base-300 rounded-lg text-left w-full overflow-auto max-h-40">
                  <p className="text-xs font-mono text-error">
                    {this.state.error?.stack || this.state.error?.toString()}
                  </p>
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
