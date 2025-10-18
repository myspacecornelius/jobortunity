import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Card from '../common/Card';

interface AuthDebugInfo {
  hasSupabase: boolean;
  currentUrl: string;
  urlHash: string;
  urlParams: Record<string, string>;
  sessionStatus: string;
  userEmail?: string;
}

const AuthDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const urlParams: Record<string, string> = {};
      new URLSearchParams(window.location.search).forEach((value, key) => {
        urlParams[key] = value;
      });

      const hashParams: Record<string, string> = {};
      new URLSearchParams(window.location.hash.substring(1)).forEach((value, key) => {
        hashParams[key] = value;
      });

      let sessionStatus = 'no-supabase';
      let userEmail: string | undefined;

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            sessionStatus = `error: ${error.message}`;
          } else if (data.session) {
            sessionStatus = 'signed-in';
            userEmail = data.session.user.email;
          } else {
            sessionStatus = 'signed-out';
          }
        } catch (err) {
          sessionStatus = `exception: ${err}`;
        }
      }

      setDebugInfo({
        hasSupabase: Boolean(supabase),
        currentUrl: window.location.href,
        urlHash: window.location.hash,
        urlParams: { ...urlParams, ...hashParams },
        sessionStatus,
        userEmail,
      });
    };

    gatherDebugInfo();
  }, []);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">Auth Debug Information</h3>
      <div className="space-y-2 text-sm font-mono">
        <div><strong>Supabase Client:</strong> {debugInfo.hasSupabase ? '✅ Available' : '❌ Missing'}</div>
        <div><strong>Session Status:</strong> {debugInfo.sessionStatus}</div>
        {debugInfo.userEmail && <div><strong>User Email:</strong> {debugInfo.userEmail}</div>}
        <div><strong>Current URL:</strong> {debugInfo.currentUrl}</div>
        <div><strong>URL Hash:</strong> {debugInfo.urlHash || '(none)'}</div>
        <div><strong>URL Parameters:</strong></div>
        <pre className="bg-muted p-2 rounded text-xs overflow-auto">
          {JSON.stringify(debugInfo.urlParams, null, 2)}
        </pre>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
      >
        Refresh Page
      </button>
    </Card>
  );
};

export default AuthDebug;