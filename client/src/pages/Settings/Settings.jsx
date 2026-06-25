import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Bell, 
  Palette, 
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const isManagement = user?.role === 'admin' || user?.role === 'librarian';

  const [activeTab, setActiveTab] = useState('profile');

  // Library Config State
  const [loanPeriod, setLoanPeriod] = useState(14);
  const [maxBorrows, setMaxBorrows] = useState(5);
  const [fineRate, setFineRate] = useState(0.25);
  const [reservationExpiry, setReservationExpiry] = useState(48);
  const [autoRenew, setAutoRenew] = useState(true);
  const [preDueReminders, setPreDueReminders] = useState(true);
  const [enforceFineCaps, setEnforceFineCaps] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // UI State
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem('notifications')) || [true, true, true]);

  useEffect(() => {
    if (isManagement) {
      setLoading(true);
      api.get('/config').then(res => {
        if (res.data) {
          setLoanPeriod(res.data.loanPeriod);
          setMaxBorrows(res.data.maxBorrows);
          setFineRate(res.data.fineRate);
          setReservationExpiry(res.data.reservationExpiry);
          setAutoRenew(res.data.autoRenew);
          setPreDueReminders(res.data.preDueReminders);
          setEnforceFineCaps(res.data.enforceFineCaps);
        }
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isManagement]);

  const handleSave = async () => {
    setSaveLoading(true);
    setMessage(null);
    try {
      if (activeTab === 'appearance') {
        localStorage.setItem('themeMode', themeMode);
        document.documentElement.className = themeMode === 'dark' ? 'dark' : '';
        setMessage({ type: 'success', text: 'Appearance settings saved.' });
      } else if (activeTab === 'notifications') {
        localStorage.setItem('notifications', JSON.stringify(notifications));
        setMessage({ type: 'success', text: 'Notification settings saved.' });
      } else if (activeTab === 'libraryConfig') {
        await api.put('/config', {
          loanPeriod, maxBorrows, fineRate, reservationExpiry, autoRenew, preDueReminders, enforceFineCaps
        });
        setMessage({ type: 'success', text: 'Library configuration saved successfully.' });
      } else {
        setMessage({ type: 'success', text: 'Profile changes saved locally.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings.' });
    } finally {
      setSaveLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
  ];
  if (isManagement) tabs.push({ id: 'libraryConfig', icon: SettingsIcon, label: 'Library Config' });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Settings</h2>
        <nav className="flex flex-col gap-1 sticky top-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage(null);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === 'libraryConfig' && 'Manage global rules, loan limits, and system behaviors.'}
              {activeTab === 'profile' && 'Update your personal details and public profile information.'}
              {activeTab === 'notifications' && 'Choose what updates you want to receive and how you receive them.'}
              {activeTab === 'appearance' && 'Customize the look and feel of your dashboard.'}
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading || saveLoading}>
            {saveLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={`mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
            {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b">
                  <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">{user?.name}</h4>
                    <p className="text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input disabled defaultValue={user?.email} className="bg-muted text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Email addresses cannot be changed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: 'New Member Registrations', desc: 'Get notified when a new user signs up.' },
                { title: 'Overdue Alerts', desc: 'Receive daily summaries of items that are overdue.' },
                { title: 'System Updates', desc: 'Announcements about new features and maintenance.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <Label className="text-base">{item.title}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={notifications[idx]} 
                    onCheckedChange={(checked) => {
                      const newN = [...notifications];
                      newN[idx] = checked;
                      setNotifications(newN);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Select a theme for the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setThemeMode('light')} 
                  className={`flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    themeMode === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-full h-24 bg-white border rounded-md p-2 flex gap-2 shadow-sm">
                    <div className="w-1/4 bg-gray-100 rounded-sm"></div>
                    <div className="flex-1 bg-gray-50 rounded-sm"></div>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Sun className="h-4 w-4" /> Light Mode
                  </div>
                </button>
                
                <button 
                  onClick={() => setThemeMode('dark')} 
                  className={`flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    themeMode === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-full h-24 bg-slate-950 border border-slate-800 rounded-md p-2 flex gap-2 shadow-sm">
                    <div className="w-1/4 bg-slate-800 rounded-sm"></div>
                    <div className="flex-1 bg-slate-900 rounded-sm"></div>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Moon className="h-4 w-4" /> Dark Mode
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Library Config Tab */}
        {activeTab === 'libraryConfig' && isManagement && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Circulation Rules</CardTitle>
                <CardDescription>Configure limits and periods for borrowing.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Standard Loan Period (Days)</Label>
                  <Input type="number" value={loanPeriod} onChange={e => setLoanPeriod(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Max Concurrent Borrows</Label>
                  <Input type="number" value={maxBorrows} onChange={e => setMaxBorrows(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Overdue Fine Rate (Rs/Day)</Label>
                  <Input type="number" step="0.01" value={fineRate} onChange={e => setFineRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Reservation Expiry (Hours)</Label>
                  <Input type="number" value={reservationExpiry} onChange={e => setReservationExpiry(Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Behaviors & Alerts</CardTitle>
                <CardDescription>Configure automated system actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Renew Eligible Items</Label>
                    <p className="text-sm text-muted-foreground">Automatically renew items that have no holds.</p>
                  </div>
                  <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="space-y-0.5">
                    <Label className="text-base">Send Pre-due Reminders</Label>
                    <p className="text-sm text-muted-foreground">Notify members 2 days before items are due.</p>
                  </div>
                  <Switch checked={preDueReminders} onCheckedChange={setPreDueReminders} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enforce Fine Caps</Label>
                    <p className="text-sm text-muted-foreground">Stop accruing fines once they exceed the item's value.</p>
                  </div>
                  <Switch checked={enforceFineCaps} onCheckedChange={setEnforceFineCaps} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
