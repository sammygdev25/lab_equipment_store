import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-shikshya-error-boundary="1" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-error, #ef4444)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
