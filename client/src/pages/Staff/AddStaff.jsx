import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Shield, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const hasMinLength = (p) => p.length >= 8;
const hasNumber = (p) => /\d/.test(p);
const hasSpecial = (p) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(p);

const AddStaff = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'librarian',
    department: '',
    city: '',
    libraryName: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const password = formData.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    if (!hasMinLength(password)) errs.password = 'Password must be at least 8 characters.';
    else if (!hasNumber(password)) errs.password = 'Password must contain at least one number.';
    else if (!hasSpecial(password)) errs.password = 'Password must contain at least one special character.';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!formData.city?.trim()) errs.city = 'City is required.';
    if (!formData.libraryName?.trim()) errs.libraryName = 'Library name is required.';
    if (!formData.securityQuestion?.trim()) errs.securityQuestion = 'Security question is required.';
    if (!formData.securityAnswer?.trim()) errs.securityAnswer = 'Answer is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await api.post('/staff', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role,
        department: formData.department || undefined,
        city: formData.city,
        libraryName: formData.libraryName,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer
      });
      toast.success('Staff member created successfully');
      navigate('/staff');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => navigate('/staff')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Staff Member</h1>
          <p className="text-muted-foreground mt-1">Create a new admin or librarian account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                className={fieldErrors.name ? "border-destructive" : ""}
              />
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@libravault.edu"
                value={formData.email}
                onChange={handleChange}
                className={fieldErrors.email ? "border-destructive" : ""}
              />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role & Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Role & Department
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
              <Select value={formData.role} onValueChange={(val) => handleSelectChange('role', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="librarian">Librarian</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.role === 'admin' ? '⚠️ Admin has full system access.' : 'Librarian can manage books and members.'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                placeholder="e.g. Circulation Desk"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
              <Input
                id="city"
                name="city"
                placeholder="New Delhi"
                value={formData.city}
                onChange={handleChange}
                className={fieldErrors.city ? "border-destructive" : ""}
              />
              {fieldErrors.city && <p className="text-xs text-destructive">{fieldErrors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="libraryName">Library Name <span className="text-destructive">*</span></Label>
              <Input
                id="libraryName"
                name="libraryName"
                placeholder="Delhi Central Library"
                value={formData.libraryName}
                onChange={handleChange}
                className={fieldErrors.libraryName ? "border-destructive" : ""}
              />
              {fieldErrors.libraryName && <p className="text-xs text-destructive">{fieldErrors.libraryName}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={fieldErrors.confirmPassword ? "border-destructive" : ""}
              />
              {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="securityQuestion">Security Question <span className="text-destructive">*</span></Label>
                <Input
                  id="securityQuestion"
                  name="securityQuestion"
                  placeholder="e.g. What is your mother's maiden name?"
                  value={formData.securityQuestion}
                  onChange={handleChange}
                  className={fieldErrors.securityQuestion ? "border-destructive" : ""}
                />
                {fieldErrors.securityQuestion && <p className="text-xs text-destructive">{fieldErrors.securityQuestion}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Answer <span className="text-destructive">*</span></Label>
                <Input
                  id="securityAnswer"
                  name="securityAnswer"
                  placeholder="Your secret answer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  className={fieldErrors.securityAnswer ? "border-destructive" : ""}
                />
                {fieldErrors.securityAnswer && <p className="text-xs text-destructive">{fieldErrors.securityAnswer}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="outline" onClick={() => navigate('/staff')} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              'Create Staff Account'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;