import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/ui/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

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
    securityAnswer: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const password = formData.password;
  const strengthScore = [hasMinLength(password), hasNumber(password), hasSpecial(password)].filter(Boolean).length;
  const strengthColors = ['bg-muted', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
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
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (emailDomain && !allowedDomains.includes(emailDomain) && !emailDomain.endsWith('.ac.in') && !emailDomain.endsWith('.edu.in')) {
      return setError('Only standard email providers or Indian college domains (.ac.in, .edu.in) are allowed.');
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      return setError('Please fill in all required fields.');
    }

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
    if (!formData.securityQuestion.trim()) {
      return setError('Please enter a security question.');
    }
    if (!formData.securityAnswer.trim()) {
      return setError('Please enter an answer to your security question.');
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone.trim() === '+91' ? undefined : formData.phone.replace(/\s+/g, ''),
        securityQuestion: formData.securityQuestion.trim(),
        securityAnswer: formData.securityAnswer.trim()
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
              to="/" 
              className="absolute -top-6 left-0 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
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

      {/* Right Side: Registration Form (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center p-6 sm:p-12 md:p-24 bg-background relative z-10 shadow-2xl overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-8">
          {/* Mobile Back Link & Logo */}
          <Link 
            to="/" 
            className="lg:hidden flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex lg:hidden items-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">LibraVault</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Create an Account</h2>
            <p className="text-muted-foreground">Join LibraVault and streamline your catalog.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Banner */}
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleRegister} noValidate>
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
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
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
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

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative mb-2">
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              {password.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-1.5 mb-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strengthScore ? strengthColors[strengthScore] : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Strength: <span className="font-semibold text-foreground">{strengthLabels[strengthScore] || 'Too weak'}</span>
                  </p>
                </div>
              )}

              {/* Checklist */}
              <ul className="text-xs text-muted-foreground space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  {hasMinLength(password) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  {hasNumber(password) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                  At least 1 number
                </li>
                <li className="flex items-center gap-2">
                  {hasSpecial(password) ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}
                  At least 1 special character
                </li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {/* Security Question */}
            <div className="space-y-2">
              <Label htmlFor="securityQuestion">Security Question</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="securityQuestion"
                name="securityQuestion"
                required
                value={formData.securityQuestion}
                onChange={handleChange}
              >
                <option value="" disabled>Select a question...</option>
                <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                <option value="In what city were you born?">In what city were you born?</option>
                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                <option value="What was your childhood nickname?">What was your childhood nickname?</option>
              </select>
            </div>

            {/* Security Answer */}
            <div className="space-y-2">
              <Label htmlFor="securityAnswer">Answer</Label>
              <Input
                id="securityAnswer"
                name="securityAnswer"
                placeholder="Your answer"
                required
                type="text"
                value={formData.securityAnswer}
                onChange={handleChange}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="terms" 
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-snug">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </Label>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full h-11 text-base mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center pb-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;