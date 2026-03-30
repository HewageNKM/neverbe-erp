import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, Button } from "antd";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="h-[400px] flex flex-col items-center justify-center bg-gray-50/50 border-dashed border-2 border-gray-200 rounded-3xl">
          <div className="flex flex-col items-center text-center px-6">
            <div className="p-4 bg-amber-50 rounded-full mb-4">
              <IconAlertTriangle size={48} className="text-amber-500" stroke={1.5} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">
              {this.props.fallbackTitle || "Intelligence Hub is Offline"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-[280px]">
              Our neural models are currently recalibrating or experiencing a sync issue.
            </p>
            <Button 
              type="primary" 
              icon={<IconRefresh size={18} />}
              onClick={() => this.setState({ hasError: false })}
              className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl h-10 px-8 font-bold shadow-lg shadow-emerald-200"
            >
              Retry Connection
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
