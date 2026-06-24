import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user was redirected from a protected route, send them back there after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(''); // clear error on new input
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-page text-on-surface font-body-base antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex">
      {/* Left: Brand Illustration (55%) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-surface-container-high items-center justify-center">
        {/* Abstract Background Blobs */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-tertiary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Glassmorphism Container for Illustration */}
        <div className="relative z-10 w-full max-w-lg p-12 backdrop-blur-md bg-bg-surface/40 border border-bg-surface/60 rounded-[24px] shadow-xl text-center">
          <div className="flex justify-center mb-8">
            <span className="material-symbols-outlined text-[120px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              library_books
            </span>
          </div>
          <h2 className="font-display-4xl text-display-4xl text-on-surface mb-4">Institutional Access</h2>
          <p className="font-body-base text-body-base text-text-secondary max-w-md mx-auto">
            The intelligent workspace for modern library management. Secure, structured, and deliberate.
          </p>
        </div>
      </div>

      {/* Right: Login Form (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-page-padding sm:px-12 md:px-24 bg-bg-surface relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Logo */}
          <div className="mb-12 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
            <span className="font-display-3xl text-display-3xl font-bold text-primary tracking-tight">LibraVault</span>
          </div>

          <div className="mb-8">
            <h1 className="font-headline-2xl text-headline-2xl text-on-surface mb-2">Welcome back</h1>
            <p className="font-body-base text-body-base text-text-secondary">Please enter your credentials to access your workspace.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <span className="material-symbols-outlined text-red-500 text-xl mt-0.5 flex-shrink-0">error</span>
              <p className="font-body-sm text-body-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div>
              <label className="block font-label-xs text-label-xs text-on-surface mb-2 uppercase" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-tertiary text-xl">mail</span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 border border-border-default rounded-[6px] bg-bg-surface text-on-surface font-body-base focus:border-primary focus:ring-0 transition-colors"
                  id="email"
                  name="email"
                  placeholder="name@institution.edu"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-xs text-label-xs text-on-surface uppercase" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="font-body-sm text-body-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-tertiary text-xl">lock</span>
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-3 border border-border-default rounded-[6px] bg-bg-surface text-on-surface font-body-base focus:border-primary focus:ring-0 transition-colors"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    className="text-text-tertiary hover:text-on-surface focus:outline-none transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-[10px] text-on-primary bg-primary brand-glow font-headline-lg text-headline-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                  Signing in…
                </>
              ) : (
                'Sign in to Workspace'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border-subtle text-center">
            <p className="font-body-sm text-body-sm text-text-secondary">
              Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
