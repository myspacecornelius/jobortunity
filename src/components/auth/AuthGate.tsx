import { FormEvent, useState } from 'react';

import Card, { CardContent } from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import AuthDebug from './AuthDebug';
import AuthTest from './AuthTest';
import { useAuth } from '../../providers/AuthProvider';

const AuthGate: React.FC = () => {
  const { status, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await signIn(email);
      setMessage('Magic link sent. Check your email to continue.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to send magic link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full p-8">
        <SectionHeader title="Sign in to orchestrate your search" subtitle="We use magic links—no passwords required." align="center" />
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-muted-foreground">
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/40"
                placeholder="you@example.com"
                disabled={status === 'loading' || isSubmitting}
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft-lg transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={status === 'loading' || isSubmitting}
            >
              {isSubmitting ? 'Sending magic link…' : 'Email me a magic link'}
            </button>
          </form>
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <p className="text-xs text-muted-foreground text-center">
            You'll stay signed in on this device. If you were expecting a team invite, ask them to add your email in Supabase.
          </p>
        </CardContent>
      </Card>
      {import.meta.env.DEV && (
        <details className="mt-8 max-w-md mx-auto">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            🔧 Developer Tools
          </summary>
          <div className="mt-4 space-y-4">
            <AuthTest />
            <AuthDebug />
          </div>
        </details>
      )}
    </div>
  );
};

export default AuthGate;