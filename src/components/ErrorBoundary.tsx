import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Result, Space } from "antd";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <Result
            status="error"
            title="Something went wrong"
            subTitle={this.state.error?.message || "An unexpected error occurred while rendering this page."}
            extra={
              <Space orientation="vertical" className="w-full" size="small">
                <Button
                  type="primary"
                  key="refresh"
                  onClick={() => window.location.reload()}
                  className="bg-emerald-600 border-emerald-600 hover:bg-emerald-700 min-w-[200px]"
                >
                  Refresh Page
                </Button>
                <Button
                  key="home"
                  onClick={() => window.location.href = "/"}
                  className="min-w-[200px]"
                >
                  Go to Dashboard
                </Button>
              </Space>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
