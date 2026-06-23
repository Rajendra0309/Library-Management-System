import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

// ─── Reusable InputField (defined at module level — never re-mounts) ──────────
const InputField = ({ label, name, type = 'text', placeholder, required = false, hint, value, onChange, error }) => (
  <div>
    <label
      className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5"
      htmlFor={name}
    >
      {label}{' '}
      {!required && <span className="normal-case font-normal">(optional)</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg border px-3 py-2 text-body-base focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm ${error
        ? 'border-red-400 focus:border-red-400 bg-red-50'
        : 'border-border-default focus:border-primary'
        }`}
    />
    {error && (
      <p className="mt-1 font-body-sm text-body-sm text-red-500 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">error</span>
        {error}
      </p>
    )}
    {hint && !error && (
      <p className="mt-1 font-body-sm text-body-sm text-text-secondary">{hint}</p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'librarian',
    department: '',
    employeeId: '',
    status: 'active',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Fetch existing staff data on mount ────────────────────────────────────
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
          employeeId: s.employeeId || '',
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
    if (error) setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
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
    setError('');
    try {
      await api.put(`/staff/${id}`, {
        name: formData.name,
        phone: formData.phone || undefined,
        role: formData.role,
        department: formData.department || undefined,
        employeeId: formData.employeeId || undefined,
        status: formData.status,
        securityQuestion: formData.securityQuestion || undefined,
        securityAnswer: formData.securityAnswer || undefined
      });
      navigate('/staff', { state: { successMsg: `"${formData.name}" updated successfully.` } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-text-tertiary animate-spin">progress_activity</span>
          <p className="font-body-sm text-body-sm text-text-secondary">Loading staff details…</p>
        </div>
      </div>
    );
  }

  // ── Fetch error state ──────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
        <p className="font-headline-lg text-headline-lg text-on-surface">{fetchError}</p>
        <button
          className="px-6 py-2.5 rounded-lg bg-primary text-white font-body-sm text-body-sm hover:opacity-90 transition-opacity"
          onClick={() => navigate('/staff')}
        >
          Back to Staff List
        </button>
      </div>
    );
  }

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
          <h1 className="font-display-3xl text-display-3xl text-on-surface">Edit Staff Member</h1>
          <p className="font-body-base text-body-base text-text-secondary">
            Editing: <span className="font-semibold text-primary">{originalEmail}</span>
          </p>
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

        {/* ── Section: Personal Info ─────────────────────────────── */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">person</span>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Full Name"
              name="name"
              placeholder="Jane Doe"
              required
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />
            {/* Email is read-only — changing email could break authentication */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5">
                Email Address <span className="normal-case font-normal text-text-tertiary">(cannot be changed)</span>
              </label>
              <input
                type="email"
                value={originalEmail}
                readOnly
                disabled
                className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base bg-surface-container-low text-text-secondary cursor-not-allowed"
              />
            </div>
            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
            />
          </div>
        </div>

        {/* ── Section: Role & Department ────────────────────────── */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">badge</span>
            Role &amp; Department
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Role Select */}
            <div>
              <label
                className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5"
                htmlFor="role"
              >
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
              value={formData.department}
              onChange={handleChange}
              error={fieldErrors.department}
            />
            <InputField
              label="Employee ID"
              name="employeeId"
              placeholder="e.g. EMP-2026-001"
              hint="Must be unique across all staff."
              value={formData.employeeId}
              onChange={handleChange}
              error={fieldErrors.employeeId}
            />

            {/* Status */}
            <div>
              <label
                className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5"
                htmlFor="status"
              >
                Account Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm bg-surface"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              {formData.status === 'suspended' && (
                <p className="mt-1 font-body-sm text-body-sm text-red-500">
                  ⚠️ Suspended staff cannot log in.
                </p>
              )}
            </div>
          </div>
        </div>
        {/* ── Section: Security Question ────────────────────────── */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">shield</span>
            Account Recovery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Security Question"
              name="securityQuestion"
              placeholder="e.g. My dog's name is?"
              value={formData.securityQuestion}
              onChange={handleChange}
              error={fieldErrors.securityQuestion}
              hint="Required for password recovery."
            />
            <InputField
              label="New Answer"
              name="securityAnswer"
              placeholder="Leave blank to keep existing"
              value={formData.securityAnswer}
              onChange={handleChange}
              error={fieldErrors.securityAnswer}
              hint="Type a new answer to change it."
            />
          </div>
        </div>

        {/* ── Form Actions ──────────────────────────────────────── */}
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
            id="edit-staff-submit-btn"
            disabled={loading}
            className="px-8 py-2.5 rounded-lg bg-primary text-white font-body-sm text-body-sm font-semibold hover:shadow-[0_4px_14px_0_rgba(91,79,232,0.39)] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;