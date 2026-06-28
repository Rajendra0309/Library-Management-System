import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { toast } from 'sonner';

// Password validation helpers
const hasMinLength = (p) => p.length >= 8;
const hasNumber = (p) => /\d/.test(p);
const hasSpecial = (p) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(p);

const STEP = {
  EMAIL: 1,
  OTP: 2,
  SECURITY_Q: 3, // Fallback
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

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
  
  // Security Question Fallback
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await api.post('/auth/forgot-password/send-otp', { email });
      setStep(STEP.OTP);
      setResendTimer(60);
      toast.success('An OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/verify-otp', { email, otp: otpInput });
      setResetToken(res.data.data.resetToken);
      setStep(STEP.NEW_PASSWORD);
      toast.success('OTP verified successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackToSecurityQuestion = async () => {
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/question', { email });
      setSecurityQuestion(res.data.data.securityQuestion);
      setStep(STEP.SECURITY_Q);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch security question.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityAnswerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const res = await api.post('/auth/forgot-password/verify-answer', { email, securityAnswer });
      setResetToken(res.data.data.resetToken);
      setStep(STEP.NEW_PASSWORD);
      toast.success('Security answer verified.');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect security answer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!hasMinLength(newPassword) || !hasNumber(newPassword) || !hasSpecial(newPassword)) {
      return setError('Password does not meet the requirements.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', { resetToken, newPassword });
      setStep(STEP.SUCCESS);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Utility to determine visual progress step (1 to 4)
  const getProgressStep = () => {
    if (step === STEP.EMAIL) return 1;
    if (step === STEP.OTP || step === STEP.SECURITY_Q) return 2;
    if (step === STEP.NEW_PASSWORD) return 3;
    return 4;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4 sm:p-8">
      <div className="w-full max-w-md bg-background rounded-[24px] shadow-2xl p-8 border">
        
        <div className="flex items-center justify-between mb-8">
          <Link to="/login" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to login
          </Link>
          <Logo className="h-8 w-8 text-primary" />
        </div>

        <StepIndicator current={getProgressStep()} total={4} />

        <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          {step === STEP.EMAIL && 'Reset your password'}
          {step === STEP.OTP && 'Verify your email'}
          {step === STEP.SECURITY_Q && 'Answer Security Question'}
          {step === STEP.NEW_PASSWORD && 'Create new password'}
          {step === STEP.SUCCESS && 'Password reset complete!'}
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* STEP 1: EMAIL */}
        {step === STEP.EMAIL && (
          <>
            <p className="text-muted-foreground text-sm mb-6">Enter your registered email address to receive an OTP.</p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send OTP
              </Button>
            </form>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === STEP.OTP && (
          <>
            <p className="text-muted-foreground text-sm mb-6">
              An OTP has been sent to <strong>{email}</strong>.
            </p>
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={6}
                  autoFocus
                  className="tracking-widest text-center text-lg"
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading || !otpInput}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Verify OTP
                </Button>
                <div className="text-center text-sm mt-2 mb-2">
                  <span className="text-muted-foreground mr-2">Didn't receive code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-primary font-medium">Resend in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleEmailSubmit} className="text-primary hover:underline font-medium">
                      Resend OTP
                    </button>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFallbackToSecurityQuestion}
                >
                  I cannot access my email
                </Button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: SECURITY QUESTION (FALLBACK) */}
        {step === STEP.SECURITY_Q && (
          <>
            <p className="text-muted-foreground text-sm mb-6">
              Answer your custom security question to recover your account.
            </p>
            <form onSubmit={handleSecurityAnswerSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Security Question</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-medium border">
                  {securityQuestion}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Your Answer</Label>
                <Input
                  id="securityAnswer"
                  type="text"
                  required
                  placeholder="Type your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !securityAnswer}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify Answer
              </Button>
            </form>
          </>
        )}

        {/* STEP 4: NEW PASSWORD */}
        {step === STEP.NEW_PASSWORD && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              <ul className="text-xs text-muted-foreground space-y-2 mt-3 p-3 bg-muted rounded-md">
                <li className="flex items-center gap-2">
                  {hasMinLength(newPassword) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  {hasNumber(newPassword) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                  At least 1 number
                </li>
                <li className="flex items-center gap-2">
                  {hasSpecial(newPassword) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                  At least 1 special character
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reset Password
            </Button>
          </form>
        )}

        {/* STEP 5: SUCCESS */}
        {step === STEP.SUCCESS && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground mb-8">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
