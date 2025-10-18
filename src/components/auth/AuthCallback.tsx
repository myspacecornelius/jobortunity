import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSkeleton from '../common/LoadingSkeleton';
import Card from '../common/Card';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        setStatus('error');
        setError('Supabase client not available');
        return;
      }

      try {
        // Parse the URL hash for auth tokens
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('[auth] callback error:', authError);
          setError(authError.message);
          setStatus('error');
          return;
        }

        if (data.session) {
          setStatus('success');
          // Redirect to main app after successful auth
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          setStatus('error');
          setError('No session found');
        }
      } catch (err) {
        console.error('[auth] callback exception:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Signing you in...</h2>
            <LoadingSkeleton lines={3} />
            <p className="text-sm text-muted-foreground">Please wait while we authenticate your session.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-emerald-900">Welcome back!</h2>
            <p className="text-sm text-muted-foreground">Authentication successful. Redirecting to your dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-rose-900">Authentication Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Sign In
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AuthCallback;