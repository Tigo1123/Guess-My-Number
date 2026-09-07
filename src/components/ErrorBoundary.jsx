import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Terminal Error Boundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="terminal-error-boundary" role="alert">
          <div className="error-panel">
            <h2>[!] SYSTEM FAULT</h2>
            <p>An unexpected exception occurred in the terminal runtime.</p>
            <p className="muted">Your saved profiles and statistics are preserved in local storage.</p>
            <div className="error-actions">
              <button
                type="button"
                className="btn-action"
                onClick={this.handleReload}
              >
                🔄 RELOAD TERMINAL
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
