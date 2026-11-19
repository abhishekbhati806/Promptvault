import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error('UI ErrorBoundary caught:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container page-center">
          <div className="empty-state">
            <h1>Something went wrong</h1>
            <p className="muted">
              An unexpected display error occurred. Reload the page to continue.
            </p>
            <div className="empty-state-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.location.assign('/')}
              >
                Return Home
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
