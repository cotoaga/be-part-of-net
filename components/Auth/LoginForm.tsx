'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/network');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorLogin = async () => {
    setEmail('visitor@be-part-of.net');
    setPassword('visitor');
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: 'visitor@be-part-of.net',
        password: 'visitor',
      });

      if (error) throw error;

      router.push('/network');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as Visitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 card">
      <h1 className="text-3xl font-bold mb-2 text-center">
        ⊙ be-part-of.net
      </h1>
      <p className="text-center text-[var(--color-text-secondary)] mb-8">
        The Anti-Social Social Network
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="w-full btn-primary"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={handleVisitorLogin}
          className="w-full btn-secondary"
          disabled={loading}
        >
          Login as Visitor
        </button>

        <div className="text-center">
          <a
            href="mailto:kurt@cotoaga.net?subject=Invitation%20Request%20for%20be-part-of.net"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Request an invite
          </a>
        </div>
      </div>
    </div>
  );
}
