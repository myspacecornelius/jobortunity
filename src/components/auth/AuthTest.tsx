import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Card from '../common/Card';

interface TestResult {
  step: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

const AuthTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runAuthTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Check if Supabase client exists
    addResult({
      step: '1. Supabase Client',
      status: supabase ? 'success' : 'error',
      message: supabase ? 'Supabase client initialized' : 'Supabase client missing',
      data: { hasSupabase: Boolean(supabase) }
    });

    if (!supabase) {
      setIsRunning(false);
      return;
    }

    // Test 2: Check auth configuration
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      addResult({
        step: '2. Auth Config',
        status: error ? 'error' : 'success',
        message: error ? `Auth error: ${error.message}` : 'Auth configuration valid',
        data: { user: user?.email || 'No user' }
      });
    } catch (err) {
      addResult({
        step: '2. Auth Config',
        status: 'error',
        message: `Auth exception: ${err}`,
        data: { error: err }
      });
    }

    // Test 3: Check session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      addResult({
        step: '3. Current Session',
        status: error ? 'error' : 'success',
        message: error ? `Session error: ${error.message}` : 
                 session ? `Active session for ${session.user.email}` : 'No active session',
        data: { hasSession: Boolean(session), user: session?.user?.email }
      });
    } catch (err) {
      addResult({
        step: '3. Current Session',
        status: 'error',
        message: `Session exception: ${err}`,
        data: { error: err }
      });
    }

    // Test 4: Test magic link sending (with a test email that won't work)
    try {
      const testEmail = 'test@example.com';
      const { error } = await supabase.auth.signInWithOtp({
        email: testEmail,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname
        }
      });
      
      addResult({
        step: '4. Magic Link Test',
        status: error ? 'error' : 'success',
        message: error ? `Magic link error: ${error.message}` : 'Magic link API functional',
        data: { error: error?.message }
      });
    } catch (err) {
      addResult({
        step: '4. Magic Link Test',
        status: 'error',
        message: `Magic link exception: ${err}`,
        data: { error: err }
      });
    }

    // Test 5: URL parsing
    const urlHash = window.location.hash;
    const hashParams = new URLSearchParams(urlHash.substring(1));
    const hasAuthTokens = hashParams.has('access_token') && hashParams.has('refresh_token');
    
    addResult({
      step: '5. URL Analysis',
      status: 'success',
      message: hasAuthTokens ? 'Auth tokens found in URL' : 'No auth tokens in URL',
      data: {
        hash: urlHash,
        hasTokens: hasAuthTokens,
        accessToken: hashParams.get('access_token')?.substring(0, 20) + '...',
        refreshToken: hashParams.get('refresh_token')?.substring(0, 20) + '...'
      }
    });

    setIsRunning(false);
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Authentication Test Suite</h3>
        <button
          onClick={runAuthTests}
          disabled={isRunning}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Auth Tests'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.status === 'success'
                  ? 'border-green-500 bg-green-50'
                  : result.status === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    result.status === 'success' ? 'text-green-700' :
                    result.status === 'error' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳'}
                  </span>
                  <span className="font-medium">{result.step}</span>
                </div>
                <span className={`text-sm ${
                  result.status === 'success' ? 'text-green-600' :
                  result.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{result.message}</p>
              {result.data && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">View Details</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AuthTest;