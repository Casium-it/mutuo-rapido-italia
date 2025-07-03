import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      errorInfo: error.message 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this might be an infinite render loop
    if (error.message.includes('Maximum update depth exceeded')) {
      console.error('🚨 Infinite render loop detected! This is likely caused by unstable useEffect dependencies.');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Si è verificato un errore
          </h2>
          <p className="text-red-600 mb-4">
            La pagina ha incontrato un problema. Prova a ricaricare la pagina.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Ricarica Pagina
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-500">
                Dettagli errore (solo sviluppo)
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                {this.state.errorInfo}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}