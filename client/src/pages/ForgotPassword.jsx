import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Logo from '../components/ui/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Circle,
  Mail,
  HelpCircle,
  Info,
  Check,
  Copy,
  Lock
} from 'lucide-react';

// Password validation helpers
const hasMinLength = (p) => p.length >= 8;
const hasNumber = (p) => /\d/.test(p);
const hasSpecial = (p) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(p);

const STEP = {
  EMAIL: 1,
  SECURITY_Q: 2,
  OTP: 3,
  NEW_PASSWORD: 4,
  SUCCESS: 5
};

const StepIndicator = ({ current, total }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
      <React.Fragment key={s}>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            s < current ? 'bg-primary text-primary-foreground' :
            s === current ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                            'bg-muted text-muted-foreground'
          }`}
        >
          {s < current ? <Check className="w-4 h-4" /> : s}
        </div>
        {s < total && (
          <div className={`flex-1 h-0.5 rounded-full transition-all ${s < current ? 'bg-primary' : 'bg-muted'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const OtpPopup = ({ otp, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-border">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="text-primary w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Your Recovery OTP</h3>
            <p className="text-sm text-muted-foreground">Valid for 10 minutes</p>
          </div>
        </div>

        <div className="bg-muted rounded-xl p-4 mb-4 flex items-center justify-between border border-border">
          <span className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground select-all">
            {otp}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 ${copied ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' : ''}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Copy this OTP and enter it in the verification field. Do not share it with anyone.
        </p>

        <Button className="w-full" onClick={onClose}>
          I've noted the OTP — Continue
        </Button>
      </div>
    </div>
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [wrongAnswerOtp, setWrongAnswerOtp] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wrongAnswer, setWrongAnswer] = useState(false);

  const clearError = () => { setError(''); setWrongAnswer(false); };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/question', { email });
      setSecurityQuestion(res.data.data.securityQuestion);
      setStep(STEP.SECURITY_Q);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find an account with that email.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/verify-answer', { email, securityAnswer });

      if (res.data.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
        setStep(STEP.NEW_PASSWORD);
      } else if (res.data.data?.otp) {
        setWrongAnswerOtp(res.data.data.otp);
        setWrongAnswer(true);
        setError('Incorrect security answer. Please try again or use the OTP fallback.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowOtp = () => setShowOtpPopup(true);

  const handleOtpPopupClose = () => {
    setShowOtpPopup(false);
    setStep(STEP.OTP);
  };

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

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!hasMinLength(newPassword)) return setError('Password must be at least 8 characters.');
    if (!hasNumber(newPassword)) return setError('Password must contain at least one number.');
    if (!hasSpecial(newPassword)) return setError('Password must contain at least one special character.');
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

  const pageWrapper = (children) => (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      {/* Left Side: Brand Illustration (55%) */}
      <div className="hidden lg:flex lg:w-[55%] h-screen sticky top-0 relative overflow-hidden bg-muted items-center justify-center">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Glassmorphism Container for Illustration */}
        <div className="relative z-10 w-full max-w-lg p-12 backdrop-blur-md bg-background/40 border rounded-[24px] shadow-2xl text-center">
          <div className="flex items-center justify-center mb-8 relative">
            <Link 
              to="/login" 
              className="absolute -top-6 left-0 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Logo className="h-12 w-12" />
            </div>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">LibraVault</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Recover your account and regain access to the workspace.
          </p>
        </div>
      </div>

      {/* Right Side: Form (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center p-6 sm:p-12 md:p-24 bg-background relative z-10 shadow-2xl overflow-y-auto">
        <div className="w-full max-w-md mx-auto relative z-10">
          {showOtpPopup && <OtpPopup otp={wrongAnswerOtp} onClose={handleOtpPopupClose} />}
          
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">LibraVault</span>
          </div>

          <div className="mb-6">
            {step < STEP.SUCCESS && <StepIndicator current={step} total={4} />}
          </div>
          
          {children}

          {/* Removed duplicate Back to Login */}
        </div>
      </div>
    </div>
  );

  // ── STEP 1: Email ──────────────────────────────────────────────────────────
  if (step === STEP.EMAIL) {
    return pageWrapper(
      <>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Forgot Password?</h1>
        <p className="text-muted-foreground text-sm mb-6">Enter your registered email address to begin.</p>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fp-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fp-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="name@institution.edu"
                className="pl-9"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…</> : 'Continue'}
          </Button>
        </form>
      </>
    );
  }

  // ── STEP 2: Security Question ──────────────────────────────────────────────
  if (step === STEP.SECURITY_Q) {
    return pageWrapper(
      <>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Security Question</h1>
        <p className="text-muted-foreground text-sm mb-6">Answer your security question to verify your identity.</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <div className="flex flex-col">
              <AlertDescription>{error}</AlertDescription>
              {wrongAnswer && (
                <button
                  type="button"
                  className="text-xs font-semibold mt-2 text-left hover:underline"
                  onClick={handleShowOtp}
                >
                  Try another way? (Use OTP)
                </button>
              )}
            </div>
          </Alert>
        )}

        <form onSubmit={handleAnswerSubmit} className="space-y-5">
          <div className="bg-muted rounded-xl p-4 border border-border flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-foreground">{securityQuestion}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sec-answer">Your Answer</Label>
            <Input
              id="sec-answer"
              type="text"
              required
              autoFocus
              value={securityAnswer}
              onChange={(e) => { setSecurityAnswer(e.target.value); clearError(); }}
              placeholder="Type your answer…"
            />
            <p className="text-xs text-muted-foreground">Casing doesn't matter.</p>
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : 'Verify Answer'}
          </Button>
        </form>
      </>
    );
  }

  // ── STEP 3: OTP ────────────────────────────────────────────────────────────
  if (step === STEP.OTP) {
    return pageWrapper(
      <>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Enter Your OTP</h1>
        <p className="text-muted-foreground text-sm mb-6">Enter the 6-digit OTP that was shown in the popup.</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription>The OTP expires in 10 minutes.</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="otp-input">OTP Code</Label>
            <Input
              id="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              autoFocus
              value={otpInput}
              onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, '')); clearError(); }}
              placeholder="000000"
              className="text-center text-2xl font-mono tracking-[0.3em] h-14"
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading || otpInput.length !== 6}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : 'Verify OTP'}
          </Button>
        </form>
      </>
    );
  }

  // ── STEP 4: New Password ───────────────────────────────────────────────────
  if (step === STEP.NEW_PASSWORD) {
    const strength = [hasMinLength(newPassword), hasNumber(newPassword), hasSpecial(newPassword)].filter(Boolean).length;
    const strengthColors = ['bg-muted', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

    return pageWrapper(
      <>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Set New Password</h1>
        <p className="text-muted-foreground text-sm mb-6">Choose a strong password for your account.</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-pass">New Password</Label>
            <div className="relative">
              <Input
                id="new-pass"
                name="new-pass"
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <>
                <div className="flex gap-1.5 mt-2 mb-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-muted'}`} />
                  ))}
                </div>
                <ul className="space-y-1 mt-2 text-xs text-muted-foreground">
                  {[
                    [hasMinLength(newPassword), 'At least 8 characters'],
                    [hasNumber(newPassword), 'Contains a number'],
                    [hasSpecial(newPassword), 'Contains a special character']
                  ].map(([ok, label]) => (
                    <li key={label} className="flex items-center gap-1.5">
                      {ok ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                      {label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pass">Confirm Password</Label>
            <Input
              id="confirm-pass"
              name="confirm-pass"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              autoComplete="new-password"
              className={confirmPassword && confirmPassword !== newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting…</> : 'Reset Password'}
          </Button>
        </form>
      </>
    );
  }

  // ── STEP 5: Success ────────────────────────────────────────────────────────
  if (step === STEP.SUCCESS) {
    return pageWrapper(
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Password Reset!</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your password has been updated. You can now log in with your new password.
        </p>
        <Button className="w-full h-11" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return null;
};

export default ForgotPassword;
