import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';

// Password validation helpers
const hasMinLength = (p) => p.length >= 8;
const hasNumber = (p) => /\d/.test(p);
const hasSpecial = (p) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(p);

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    city: ''
  });
  
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, sending, sent, verifying, verified
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const password = formData.password;
  const strengthScore = [hasMinLength(password), hasNumber(password), hasSpecial(password)].filter(Boolean).length;
  const strengthColors = ['bg-muted', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      return toast.error('Please enter your email first.');
    }
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (emailDomain && !allowedDomains.includes(emailDomain) && !emailDomain.endsWith('.ac.in') && !emailDomain.endsWith('.edu.in')) {
      return toast.error('Only standard email providers or Indian college domains (.ac.in, .edu.in) are allowed.');
    }

    setVerificationStatus('sending');
    try {
      await api.post('/auth/send-verification-otp', { email: formData.email });
      toast.success('Verification OTP sent to your email!');
      setVerificationStatus('sent');
      setResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
      setVerificationStatus('idle');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return toast.error('Please enter the OTP.');
    setVerificationStatus('verifying');
    try {
      await api.post('/auth/verify-registration-otp', { email: formData.email, otp });
      toast.success('Email verified successfully!');
      setVerificationStatus('verified');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
      setVerificationStatus('sent');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (verificationStatus !== 'verified') {
      return toast.error('Please verify your email using the OTP before registering.');
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || !formData.city.trim() || !formData.phone.trim() || formData.phone.trim() === '+91') {
      return toast.error('Please fill in all required fields (including Phone and City).');
    }

    if (!hasMinLength(password) || !hasNumber(password) || !hasSpecial(password)) {
      return toast.error('Please ensure your password meets all requirements.');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (!formData.securityQuestion.trim()) {
      return toast.error('Please enter a custom security question.');
    }
    if (!formData.securityAnswer.trim()) {
      return toast.error('Please enter an answer to your security question.');
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone.trim() === '+91' ? undefined : formData.phone.replace(/\s+/g, ''),
        securityQuestion: formData.securityQuestion.trim(),
        securityAnswer: formData.securityAnswer.trim(),
        city: formData.city.trim(),
        otp: otp.trim()
      });
      toast.success('Account created successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      <div className="hidden lg:flex lg:w-[55%] h-screen sticky top-0 relative overflow-hidden bg-muted items-center justify-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative z-10 w-full max-w-lg p-12 backdrop-blur-md bg-background/40 border rounded-[24px] shadow-2xl text-center">
          <div className="flex items-center justify-center mb-8 relative">
            <Link to="/" className="absolute -top-6 left-0 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Logo className="h-12 w-12" />
            </div>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">LibraVault</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            The next generation library management workspace. Preserve the past, index the future.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col justify-center p-6 sm:p-12 md:p-24 bg-background relative z-10 shadow-2xl overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-8">
          <Link to="/" className="lg:hidden flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">LibraVault</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Create an Account</h2>
            <p className="text-muted-foreground">Join LibraVault and streamline your catalog.</p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister} noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required type="text" value={formData.name} onChange={handleChange} autoComplete="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="email" name="email" placeholder="jane@institution.edu" required type="email" value={formData.email} onChange={handleChange} autoComplete="email" 
                  disabled={verificationStatus === 'verified' || verificationStatus === 'sending' || verificationStatus === 'verifying'} 
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant={verificationStatus === 'verified' ? 'default' : 'secondary'}
                  className={verificationStatus === 'verified' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  onClick={handleSendOtp}
                  disabled={verificationStatus === 'verified' || verificationStatus === 'sending' || verificationStatus === 'verifying'}
                >
                  {verificationStatus === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                   verificationStatus === 'verified' ? 'Verified' : 'Verify'}
                </Button>
              </div>
            </div>

            {(verificationStatus === 'sent' || verificationStatus === 'verifying') && (
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
                <Label htmlFor="otp" className="text-sm">Enter Verification OTP</Label>
                <div className="flex gap-2">
                  <Input 
                    id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} 
                    placeholder="Enter 6-digit OTP" className="flex-1" maxLength={6}
                  />
                  <Button type="button" onClick={handleVerifyOtp} disabled={verificationStatus === 'verifying'}>
                    {verificationStatus === 'verifying' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {resendTimer > 0 ? (
                    <span>Resend OTP in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleSendOtp} className="text-primary hover:underline">Resend OTP</button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Mumbai" required type="text" value={formData.city} onChange={handleChange} autoComplete="address-level2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="phone" name="phone" placeholder="+91 98765 43210" type="tel" value={formData.phone} onChange={handleChange} autoComplete="tel" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative mb-2">
                <Input id="password" name="password" placeholder="••••••••" required type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} autoComplete="new-password" className="pr-10" />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none" type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-1.5 mb-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strengthScore ? strengthColors[strengthScore] : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Strength: <span className="font-semibold text-foreground">{strengthLabels[strengthScore] || 'Too weak'}</span>
                  </p>
                </div>
              )}

              <ul className="text-xs text-muted-foreground space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  {hasMinLength(password) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />} At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  {hasNumber(password) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />} At least 1 number
                </li>
                <li className="flex items-center gap-2">
                  {hasSpecial(password) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />} At least 1 special character
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" placeholder="••••••••" required type="password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityQuestion">Custom Security Question</Label>
              <Input
                id="securityQuestion"
                name="securityQuestion"
                placeholder="e.g. What is my favorite book?"
                required
                type="text"
                value={formData.securityQuestion}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityAnswer">Security Answer</Label>
              <Input id="securityAnswer" name="securityAnswer" placeholder="Your secret answer" required type="text" value={formData.securityAnswer} onChange={handleChange} />
            </div>

            <Button className="w-full mt-6" type="submit" disabled={loading || verificationStatus !== 'verified'}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;