import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'librarian',
    department: '',
    city: '',
    libraryName: '',
    status: 'active',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchStaff = async () => {
      setFetchLoading(true);
      try {
        const res = await api.get(`/staff/${id}`);
        const s = res.data.data;
        setFormData({
          name: s.name || '',
          phone: s.phone || '',
          role: s.role || 'librarian',
          department: s.department || '',
          city: s.city || '',
          libraryName: s.libraryName || '',
          status: s.status || 'active',
          securityQuestion: s.securityQuestion || '',
          securityAnswer: ''
        });
        setOriginalEmail(s.email || '');
      } catch (err) {
        setFetchError(err.response?.data?.message || 'Failed to load staff member.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

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
    if (!formData.city?.trim()) errs.city = 'City is required.';
    if (!formData.libraryName?.trim()) errs.libraryName = 'Library name is required.';
    if (!formData.securityQuestion?.trim()) errs.securityQuestion = 'Security question is required.';
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
      await api.put(`/staff/${id}`, {
        name: formData.name,
        phone: formData.phone || undefined,
        role: formData.role,
        department: formData.department || undefined,
        city: formData.city,
        libraryName: formData.libraryName,
        status: formData.status,
        securityQuestion: formData.securityQuestion || undefined,
        securityAnswer: formData.securityAnswer || undefined
      });
      toast.success('Staff details updated successfully');
      navigate('/staff');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p>Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">{fetchError}</h2>
        <Button onClick={() => navigate('/staff')}>Back to Staff List</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => navigate('/staff')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Staff Profile</h1>
            <Badge variant={formData.status === 'active' ? 'default' : 'secondary'} className="uppercase">
              {formData.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Update personal info and access privileges.</p>
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
              <Label htmlFor="email">Email Address <span className="text-muted-foreground font-normal">(cannot be changed)</span></Label>
              <Input
                id="email"
                type="email"
                value={originalEmail}
                readOnly
                disabled
                className="bg-muted text-muted-foreground"
              />
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Account Status <span className="text-destructive">*</span></Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
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

        {/* Security Update */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security Question
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="securityAnswer">Answer <span className="font-normal text-muted-foreground">(leave blank to keep current)</span></Label>
              <Input
                id="securityAnswer"
                name="securityAnswer"
                placeholder="New secret answer"
                value={formData.securityAnswer}
                onChange={handleChange}
                className={fieldErrors.securityAnswer ? "border-destructive" : ""}
              />
              {fieldErrors.securityAnswer && <p className="text-xs text-destructive">{fieldErrors.securityAnswer}</p>}
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
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;