import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSignature, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // error is set in store
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen">
      {/* Left – branding */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <FileSignature className="h-8 w-8" />
            SignFlow
          </div>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Digital document signing, simplified.
          </h1>
          <p className="mt-4 text-primary-200 text-lg">
            Securely sign, manage, and track your documents from anywhere.
          </p>
        </div>
        <p className="text-primary-300 text-sm">
          &copy; 2026 SignFlow. All rights reserved.
        </p>
      </div>

      {/* Right – form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-primary-700 lg:hidden">
            <FileSignature className="h-7 w-7" />
            SignFlow
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account to continue.
          </p>

          {displayError && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
