
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 FormErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 FormErrorBoundary error details:', error, errorInfo);
    
    // Check if it's likely an infinite re-render loop
    if (error.message.includes('Maximum update depth exceeded') || 
        error.message.includes('Too many re-renders')) {
      console.error('🔄 Infinite re-render loop detected in form');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Si è verificato un errore nel form
          </h3>
          <p className="text-red-600 mb-4">
            Il form ha riscontrato un problema tecnico. Prova a ricaricare la pagina.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Ricarica Pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
