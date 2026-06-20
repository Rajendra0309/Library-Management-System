import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Password validation helpers
const hasMinLength = (p) => p.length >= 8;
const hasNumber = (p) => /\d/.test(p);
const hasSpecial = (p) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(p);

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const password = formData.password;
  const strengthScore = [hasMinLength(password), hasNumber(password), hasSpecial(password)].filter(Boolean).length;
  const strengthColors = ['bg-surface-variant', 'bg-error', 'bg-warning', 'bg-success'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (!hasMinLength(password)) {
      return setError('Password must be at least 8 characters long.');
    }
    if (!hasNumber(password)) {
      return setError('Password must contain at least one number.');
    }
    if (!hasSpecial(password)) {
      return setError('Password must contain at least one special character.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined
      });
      setSuccess('Account created successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-bg-page text-on-surface font-body-base antialiased">
      {/* Left Side: Brand Illustration (55%) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-surface-container-high flex-col items-center justify-center p-12">
        {/* Decorative Blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-primary-fixed opacity-60 blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-[40%] -right-[20%] w-[500px] h-[500px] rounded-full bg-tertiary-fixed opacity-40 blur-3xl mix-blend-multiply"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="mb-8 p-6 bg-surface rounded-3xl shadow-xl flex items-center justify-center">
            <svg fill="none" height="80" viewBox="0 0 24 24" width="80" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5C4 18.837 4.537 18.3 5.2 18.3H20V4.2C20 3.537 19.463 3 18.8 3H5.2C4.537 3 4 3.537 4 4.2V19.5ZM4 19.5V21H18.8C19.463 21 20 20.463 20 19.8V18.3H5.2C4.537 18.3 4 18.837 4 19.5Z" fill="#5B4FE8"></path>
              <path d="M8 7H16M8 11H16M8 15H12" stroke="#8B5CF6" strokeLinecap="round" strokeWidth="1.5"></path>
            </svg>
          </div>
          <h1 className="font-display-4xl text-display-4xl text-on-primary-fixed mb-4">LibraVault</h1>
          <p className="font-headline-lg text-headline-lg text-primary max-w-md">The next generation library management workspace. Preserve the past, index the future.</p>
        </div>
      </div>

      {/* Right Side: Registration Form (45%) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-surface z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] relative overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo Fallback */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary text-[32px]">menu_book</span>
            <span className="font-headline-xl text-headline-xl text-primary font-bold">LibraVault</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-headline-2xl text-headline-2xl mb-2 text-on-surface">Create an Account</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Join LibraVault and streamline your catalog.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <span className="material-symbols-outlined text-red-500 text-xl mt-0.5 flex-shrink-0">error</span>
              <p className="font-body-sm text-body-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <span className="material-symbols-outlined text-green-600 text-xl mt-0.5 flex-shrink-0">check_circle</span>
              <p className="font-body-sm text-body-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Full Name */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="name">Full Name</label>
              <input
                className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
                id="name"
                name="name"
                placeholder="Jane Doe"
                required
                type="text"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]">mail</span>
                <input
                  className="w-full rounded-lg border border-border-default pl-10 pr-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
                  id="email"
                  name="email"
                  placeholder="jane@institution.edu"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="phone">Phone Number <span className="normal-case">(optional)</span></label>
              <input
                className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
                id="phone"
                name="phone"
                placeholder="+91 98765 43210"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="password">Password</label>
              <div className="relative mb-2.5">
                <input
                  className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-on-surface-variant"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </div>

              {/* Strength Meter */}
              {password.length > 0 && (
                <>
                  <div className="flex gap-1.5 mb-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strengthScore ? strengthColors[strengthScore] : 'bg-surface-variant'}`}
                      />
                    ))}
                  </div>
                  <p className="font-body-sm text-body-sm text-text-secondary mb-2">
                    Strength: <span className="font-semibold">{strengthLabels[strengthScore] || 'Too weak'}</span>
                  </p>
                </>
              )}

              {/* Checklist */}
              <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[16px] ${hasMinLength(password) ? 'text-green-500' : 'text-outline'}`} style={{ fontVariationSettings: hasMinLength(password) ? "'FILL' 1" : "'FILL' 0" }}>
                    {hasMinLength(password) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[16px] ${hasNumber(password) ? 'text-green-500' : 'text-outline'}`} style={{ fontVariationSettings: hasNumber(password) ? "'FILL' 1" : "'FILL' 0" }}>
                    {hasNumber(password) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  At least one number
                </li>
                <li className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[16px] ${hasSpecial(password) ? 'text-green-500' : 'text-outline'}`} style={{ fontVariationSettings: hasSpecial(password) ? "'FILL' 1" : "'FILL' 0" }}>
                    {hasSpecial(password) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  At least one special character
                </li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
              <input
                className={`w-full rounded-lg border px-3 py-2 text-body-base focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm ${formData.confirmPassword && formData.confirmPassword !== formData.password
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-border-default focus:border-primary'
                  }`}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                <p className="mt-1 font-body-sm text-body-sm text-red-500">Passwords do not match.</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input
                  className="rounded border-border-default text-primary focus:ring-primary focus:ring-2 h-4 w-4 transition-colors"
                  required
                  type="checkbox"
                  id="terms"
                />
              </div>
              <label className="font-body-sm text-body-sm text-on-surface-variant leading-tight" htmlFor="terms">
                I agree to the <a className="text-primary hover:underline font-medium" href="#">Terms of Service</a> and <a className="text-primary hover:underline font-medium" href="#">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="w-full rounded-lg bg-brand-gradient text-on-primary font-headline-lg text-headline-lg py-3 flex items-center justify-center gap-2 hover:shadow-brand-glow transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
                id="register-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center border-t border-border-subtle pt-6">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;