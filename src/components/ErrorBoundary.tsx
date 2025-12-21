import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full border-l-4 border-red-500">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-4">The application encountered an unexpected error.</p>

                        <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto mb-6">
                            <p className="font-mono text-sm text-red-500 font-semibold mb-2">
                                {this.state.error?.name}: {this.state.error?.message}
                            </p>
                            <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap">
                                {this.state.error?.stack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
