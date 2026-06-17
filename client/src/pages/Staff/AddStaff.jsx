import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// Password validation helpers
const hasMinLength  = (p) => p.length >= 8;
const hasNumber     = (p) => /\d/.test(p);
const hasSpecial    = (p) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(p);

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
    employeeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [fieldErrors, setFieldErrors]   = useState({});

  const password = formData.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
    if (error) setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())    errs.name  = 'Full name is required.';
    if (!formData.email.trim())   errs.email = 'Email is required.';
    if (!hasMinLength(password))  errs.password = 'Password must be at least 8 characters.';
    else if (!hasNumber(password)) errs.password = 'Password must contain at least one number.';
    else if (!hasSpecial(password)) errs.password = 'Password must contain at least one special character.';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
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
    setError('');
    try {
      await api.post('/staff', {
        name:       formData.name,
        email:      formData.email,
        password:   formData.password,
        phone:      formData.phone   || undefined,
        role:       formData.role,
        department: formData.department  || undefined,
        employeeId: formData.employeeId  || undefined
      });
      navigate('/staff', { state: { successMsg: `Staff member "${formData.name}" added successfully.` } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = 'text', placeholder, required = false, hint, children }) => (
    <div>
      <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor={name}>
        {label} {!required && <span className="normal-case font-normal">(optional)</span>}
      </label>
      {children || (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full rounded-lg border px-3 py-2 text-body-base focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm ${
            fieldErrors[name]
              ? 'border-red-400 focus:border-red-400 bg-red-50'
              : 'border-border-default focus:border-primary'
          }`}
        />
      )}
      {fieldErrors[name] && (
        <p className="mt-1 font-body-sm text-body-sm text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {fieldErrors[name]}
        </p>
      )}
      {hint && !fieldErrors[name] && (
        <p className="mt-1 font-body-sm text-body-sm text-text-secondary">{hint}</p>
      )}
    </div>
  );

  return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="p-2 rounded-lg border border-border-default text-on-surface-variant hover:bg-bg-hover transition-colors"
          onClick={() => navigate('/staff')}
          title="Back to staff list"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <div>
          <h1 className="font-display-3xl text-display-3xl text-on-surface">Add Staff Member</h1>
          <p className="font-body-base text-body-base text-text-secondary">Create a new admin or librarian account.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="material-symbols-outlined text-red-500 text-xl mt-0.5 flex-shrink-0">error</span>
          <p className="font-body-sm text-body-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface rounded-[14px] shadow-sm border border-border-subtle">
        {/* Section: Personal Info */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">person</span>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="Full Name" name="name" placeholder="Jane Doe" required />
            <InputField label="Email Address" name="email" type="email" placeholder="jane@libravault.edu" required />
            <InputField label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" />
          </div>
        </div>

        {/* Section: Role & Department */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">badge</span>
            Role & Department
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Role Select */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="role">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm bg-surface"
              >
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 font-body-sm text-body-sm text-text-secondary">
                {formData.role === 'admin'
                  ? '⚠️ Admin has full system access.'
                  : 'Librarian can manage books and members.'}
              </p>
            </div>
            <InputField
              label="Department"
              name="department"
              placeholder="e.g. Rare Books, Circulation Desk"
            />
            <InputField
              label="Employee ID"
              name="employeeId"
              placeholder="e.g. EMP-2026-001"
              hint="Must be unique across all staff."
            />
          </div>
        </div>

        {/* Section: Password */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">lock</span>
            Set Password
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Password */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full rounded-lg border px-3 pr-10 py-2 text-body-base focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm ${
                    fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-border-default focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-on-surface-variant"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 font-body-sm text-body-sm text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {fieldErrors.password}
                </p>
              )}
              {/* Checklist */}
              {password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {[
                    [hasMinLength(password), 'At least 8 characters'],
                    [hasNumber(password),    'Contains a number'],
                    [hasSpecial(password),   'Contains a special character']
                  ].map(([ok, label]) => (
                    <li key={label} className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                      <span className={`material-symbols-outlined text-[14px] ${ok ? 'text-green-500' : 'text-outline'}`} style={{ fontVariationSettings: ok ? "'FILL' 1" : "'FILL' 0" }}>
                        {ok ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-border-default font-body-sm text-body-sm text-on-surface hover:bg-bg-hover transition-colors"
            onClick={() => navigate('/staff')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            id="add-staff-submit-btn"
            disabled={loading}
            className="px-8 py-2.5 rounded-lg bg-primary text-white font-body-sm text-body-sm font-semibold hover:shadow-[0_4px_14px_0_rgba(91,79,232,0.39)] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Creating…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">person_add</span>
                Create Staff Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;
