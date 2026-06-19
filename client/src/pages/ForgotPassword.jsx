import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Password validation helpers
const hasMinLength = (p) => p.length >= 8;
const hasNumber    = (p) => /\d/.test(p);
const hasSpecial   = (p) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(p);

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEP = {
  EMAIL:         1,  // Enter email → fetch security question
  SECURITY_Q:   2,  // Answer security question
  OTP:           3,  // Security answer was wrong → enter OTP shown in popup
  NEW_PASSWORD:  4,  // Verified → set new password
  SUCCESS:       5   // Done
};

// ─── OTP Popup Component ──────────────────────────────────────────────────────
const OtpPopup = ({ otp, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-border-subtle">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock_open
            </span>
          </div>
          <div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Your Recovery OTP</h3>
            <p className="font-body-sm text-body-sm text-text-secondary">Valid for 10 minutes</p>
          </div>
        </div>

        {/* OTP Display */}
        <div className="bg-surface-container-low rounded-xl p-4 mb-4 flex items-center justify-between border border-border-default">
          <span className="font-mono text-3xl font-bold tracking-[0.3em] text-on-surface select-all">
            {otp}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold transition-all ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-text-secondary mb-5">
          Copy this OTP and enter it in the verification field. Do not share it with anyone.
        </p>

        <button
          className="w-full py-2.5 rounded-lg bg-primary text-white font-body-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]"
          onClick={onClose}
        >
          I've noted the OTP — Continue
        </button>
      </div>
    </div>
  );
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
      <React.Fragment key={s}>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
            s < current  ? 'bg-primary text-white' :
            s === current ? 'bg-primary text-white ring-4 ring-primary/20' :
            'bg-surface-container-low text-text-tertiary'
          }`}
        >
          {s < current ? (
            <span className="material-symbols-outlined text-[14px]">check</span>
          ) : s}
        </div>
        {s < total && (
          <div className={`flex-1 h-0.5 rounded-full transition-all ${s < current ? 'bg-primary' : 'bg-surface-container-low'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]                     = useState(STEP.EMAIL);
  const [email, setEmail]                   = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [otpInput, setOtpInput]             = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [resetToken, setResetToken]         = useState('');

  // OTP popup
  const [otpPopupValue, setOtpPopupValue]   = useState('');
  const [showOtpPopup, setShowOtpPopup]     = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const clearError = () => setError('');

  // ── Step 1: Fetch security question by email ──────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/question', { email });
      setSecurityQuestion(res.data.data.securityQuestion);
      setStep(STEP.SECURITY_Q);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find account. Check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify security answer ───────────────────────────────────────
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/verify-answer', { email, securityAnswer });

      if (res.data.data?.resetToken) {
        // Correct answer — go straight to password reset
        setResetToken(res.data.data.resetToken);
        setStep(STEP.NEW_PASSWORD);
      } else if (res.data.data?.otp) {
        // Wrong answer — show OTP popup then move to OTP step
        setOtpPopupValue(res.data.data.otp);
        setShowOtpPopup(true);
        // Step transition happens after user closes popup (see OtpPopup onClose)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpPopupClose = () => {
    setShowOtpPopup(false);
    setStep(STEP.OTP);
  };

  // ── Step 3: Verify OTP ────────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/verify-otp', { email, otp: otpInput });
      setResetToken(res.data.data.resetToken);
      setStep(STEP.NEW_PASSWORD);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Reset password ────────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!hasMinLength(newPassword)) return setError('Password must be at least 8 characters.');
    if (!hasNumber(newPassword))    return setError('Password must contain at least one number.');
    if (!hasSpecial(newPassword))   return setError('Password must contain at least one special character.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', { resetToken, newPassword });
      setStep(STEP.SUCCESS);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please restart the process.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared card wrapper ───────────────────────────────────────────────────
  const Card = ({ title, subtitle, children, onSubmit }) => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
        <span className="font-display-3xl text-display-3xl font-bold text-primary tracking-tight">LibraVault</span>
      </div>
      <StepIndicator current={step} total={4} />
      <h1 className="font-headline-2xl text-headline-2xl text-on-surface mb-1">{title}</h1>
      <p className="font-body-base text-body-base text-text-secondary mb-6">{subtitle}</p>

      {error && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="material-symbols-outlined text-red-500 text-xl mt-0.5 flex-shrink-0">error</span>
          <p className="font-body-sm text-body-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {children}
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="font-body-sm text-body-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Login
        </Link>
      </div>
    </div>
  );

  // ── STEP 1: Email ─────────────────────────────────────────────────────────
  if (step === STEP.EMAIL) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-6">
        <Card
          title="Forgot Password?"
          subtitle="Enter your registered email address to begin."
          onSubmit={handleEmailSubmit}
        >
          <div>
            <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="fp-email">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]">mail</span>
              <input
                id="fp-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="name@institution.edu"
                className="w-full rounded-lg border border-border-default pl-10 pr-3 py-2.5 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-headline-lg text-headline-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </Card>
      </div>
    );
  }

  // ── STEP 2: Security Question ─────────────────────────────────────────────
  if (step === STEP.SECURITY_Q) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-6">
        {showOtpPopup && (
          <OtpPopup otp={otpPopupValue} onClose={handleOtpPopupClose} />
        )}
        <Card
          title="Security Question"
          subtitle="Answer your security question to verify your identity."
          onSubmit={handleAnswerSubmit}
        >
          {/* Display the question */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-border-default flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
            <p className="font-body-base text-body-base text-on-surface font-medium">{securityQuestion}</p>
          </div>

          <div>
            <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="sec-answer">
              Your Answer
            </label>
            <input
              id="sec-answer"
              type="text"
              required
              autoFocus
              value={securityAnswer}
              onChange={(e) => { setSecurityAnswer(e.target.value); clearError(); }}
              placeholder="Type your answer…"
              className="w-full rounded-lg border border-border-default px-3 py-2.5 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
            />
            <p className="mt-1 font-body-sm text-body-sm text-text-secondary">
              Casing doesn't matter. If you get this wrong, an OTP will be generated for you.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-headline-lg text-headline-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
            {loading ? 'Verifying…' : 'Verify Answer'}
          </button>
        </Card>
      </div>
    );
  }

  // ── STEP 3: OTP Verification ──────────────────────────────────────────────
  if (step === STEP.OTP) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-6">
        <Card
          title="Enter Your OTP"
          subtitle="Enter the 6-digit OTP that was shown in the popup."
          onSubmit={handleOtpSubmit}
        >
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-xl flex-shrink-0">info</span>
            <p className="font-body-sm text-body-sm text-amber-700">
              The OTP expires in 10 minutes. Make sure you have it copied before proceeding.
            </p>
          </div>

          <div>
            <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="otp-input">
              OTP Code
            </label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              autoFocus
              value={otpInput}
              onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, '')); clearError(); }}
              placeholder="000000"
              className="w-full rounded-lg border border-border-default px-3 py-3 text-body-base font-mono text-center tracking-[0.3em] text-xl focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpInput.length !== 6}
            className="w-full py-3 rounded-lg bg-primary text-white font-headline-lg text-headline-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </Card>
      </div>
    );
  }

  // ── STEP 4: New Password ──────────────────────────────────────────────────
  if (step === STEP.NEW_PASSWORD) {
    const strength = [hasMinLength(newPassword), hasNumber(newPassword), hasSpecial(newPassword)].filter(Boolean).length;
    const strengthColors = ['bg-surface-variant', 'bg-error', 'bg-warning', 'bg-success'];

    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-6">
        <Card
          title="Set New Password"
          subtitle="Choose a strong password for your account."
          onSubmit={handleResetSubmit}
        >
          {/* New Password */}
          <div>
            <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="new-pass">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-pass"
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-lg border border-border-default px-3 pr-10 py-2.5 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-on-surface-variant"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            {/* Strength bars */}
            {newPassword.length > 0 && (
              <>
                <div className="flex gap-1.5 mt-2 mb-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-surface-variant'}`} />
                  ))}
                </div>
                <ul className="space-y-1 mt-2">
                  {[
                    [hasMinLength(newPassword), 'At least 8 characters'],
                    [hasNumber(newPassword),    'Contains a number'],
                    [hasSpecial(newPassword),   'Contains a special character']
                  ].map(([ok, label]) => (
                    <li key={label} className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                      <span className={`material-symbols-outlined text-[14px] ${ok ? 'text-green-500' : 'text-outline'}`} style={{ fontVariationSettings: ok ? "'FILL' 1" : "'FILL' 0" }}>
                        {ok ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="confirm-pass">
              Confirm Password
            </label>
            <input
              id="confirm-pass"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`w-full rounded-lg border px-3 py-2.5 text-body-base focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-border-default focus:border-primary'
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 font-body-sm text-body-sm text-red-500">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            id="reset-password-submit-btn"
            className="w-full py-3 rounded-lg bg-primary text-white font-headline-lg text-headline-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : null}
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </Card>
      </div>
    );
  }

  // ── STEP 5: Success ───────────────────────────────────────────────────────
  if (step === STEP.SUCCESS) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-display-3xl text-display-3xl text-on-surface mb-2">Password Reset!</h1>
          <p className="font-body-base text-body-base text-text-secondary mb-8">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <button
            className="w-full py-3 rounded-lg bg-primary text-white font-headline-lg text-headline-lg hover:opacity-90 active:scale-[0.97] transition-all"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ForgotPassword;
