/**
 * Error Boundary Component
 * Catches and displays React errors gracefully
 */

import { Component } from 'react';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <GlassCard className="max-w-2xl">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🌌</div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong in the universe
              </h1>
              <p className="text-white/70 mb-6">
                The blockchain constellation encountered an error. Don't worry, 
                we can get back to exploring the cosmos.
              </p>
              
              <div className="flex gap-4 justify-center">
                <GlassButton
                  onClick={() => window.location.reload()}
                >
                  🔄 Reload Universe
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                >
                  🚀 Try Again
                </GlassButton>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="text-white/60 cursor-pointer mb-2">
                    🔧 Developer Details
                  </summary>
                  <div className="bg-black/50 p-4 rounded-lg text-xs font-mono text-red-400 overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;