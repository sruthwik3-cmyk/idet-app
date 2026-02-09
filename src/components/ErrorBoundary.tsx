import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
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
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--background)',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(248, 113, 113, 0.1)',
                        borderRadius: '50%',
                        marginBottom: '2rem',
                        border: '1px solid rgba(248, 113, 113, 0.2)'
                    }}>
                        <AlertTriangle size={48} color="var(--danger)" />
                    </div>

                    <h2 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Something went wrong</h2>
                    <p style={{ maxWidth: '500px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        We're sorry, but the application encountered an unexpected error.
                        <br />
                        <span style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '1rem', display: 'block', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '8px', fontFamily: 'monospace' }}>
                            {this.state.error?.message}
                        </span>
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary-full"
                        style={{ width: 'auto', padding: '0.75rem 2rem', gap: '0.75rem' }}
                    >
                        <RefreshCw size={20} />
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
