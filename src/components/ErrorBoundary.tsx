import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#FAF9F6',
          fontFamily: "'Heebo', sans-serif",
          direction: 'rtl',
        }}>
          <div style={{
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            background: 'white',
            borderRadius: '32px',
            padding: '48px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😵</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px', color: '#1A1A1A' }}>
              משהו השתבש
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
              אירעה שגיאה בלתי צפויה. נסה לרענן את הדף.
            </p>
            {this.state.error && (
              <details style={{
                background: '#F9FAFB',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '24px',
                textAlign: 'left',
                direction: 'ltr',
              }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#9CA3AF' }}>Error details</summary>
                <pre style={{ fontSize: '0.75rem', color: '#EF4444', whiteSpace: 'pre-wrap', marginTop: '8px' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              style={{
                padding: '16px 32px',
                borderRadius: '24px',
                background: '#2a19e6',
                color: 'white',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(42, 25, 230, 0.3)',
                fontFamily: 'inherit',
              }}
            >
              נסה שוב
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
