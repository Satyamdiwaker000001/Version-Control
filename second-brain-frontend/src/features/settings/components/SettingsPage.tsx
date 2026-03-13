import { useState, useEffect } from 'react';
import { 
  User, Palette, Github, Users, Shield, Save, 
  Moon, Sun, Monitor, RefreshCw, Lock, Bell,
  CreditCard, Globe, Zap, Trash2, Download, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import type { ThemeMode } from '@/shared/store/useThemeStore';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';

type SettingsTab = 'profile' | 'appearance' | 'github' | 'workspace' | 'security' | 'notifications' | 'billing' | 'advanced';

const ProfileSettings = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const email = user?.email || '';

  const handleSave = async () => {
    try {
      await updateProfile({ name });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Public Profile</h2>
           <p className="text-sm text-zinc-500 dark:text-zinc-400">This is how others will see you on the platform.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isLoading}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={16} />} 
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Avatar</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xl border border-indigo-200 dark:border-indigo-800">
              {email.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={() => toast.info('Avatar upload feature coming soon!')}
              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-500 transition-colors cursor-not-allowed"
          />
          <p className="text-[10px] text-zinc-500 mt-1">Email cannot be changed.</p>
        </div>
      </div>
    </div>
  );
};

const ThemeSettings = () => {
  const { themeMode, setTheme } = useThemeStore();

  const handleSetTheme = (mode: ThemeMode) => {
    setTheme(mode);
    toast.success(`Theme set to ${mode}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
         <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Appearance</h2>
         <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize the UI theme of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <button 
          onClick={() => handleSetTheme('light')}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${themeMode === 'light' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}
        >
          <Sun size={32} />
          <span className="font-medium text-sm">Light</span>
        </button>
        <button 
          onClick={() => handleSetTheme('dark')}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${themeMode === 'dark' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}
        >
          <Moon size={32} />
          <span className="font-medium text-sm">Dark</span>
        </button>
        <button 
          onClick={() => handleSetTheme('system')}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${themeMode === 'system' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}
        >
          <Monitor size={32} />
          <span className="font-medium text-sm">System</span>
        </button>
      </div>
    </div>
  );
};

const GithubSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
         <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
           <Github size={20} /> GitHub Integration
         </h2>
         <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your connected GitHub accounts and repositories.</p>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div>
           <p className="font-semibold text-zinc-900 dark:text-white">Connected Account</p>
           <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <Shield size={14} /> Authenticated successfully
           </p>
         </div>
         <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300">
           Configure Repositories
         </button>
      </div>
    </div>
  );
};

const WorkspaceSettings = () => {
  const { activeWorkspace, members, fetchMembers, addMember, removeMember, isLoading } = useWorkspaceStore();
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (activeWorkspace) fetchMembers(activeWorkspace.id);
  }, [activeWorkspace, fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !activeWorkspace) return;
    try {
      await addMember(activeWorkspace.id, inviteEmail);
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invite');
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    if (role === 'Remove') {
      if (confirm('Are you sure you want to remove this member?')) {
        try {
          await removeMember(activeWorkspace!.id, memberId);
          toast.success('Member removed');
        } catch (err: any) {
          toast.error(err.message || 'Failed to remove member');
        }
      }
      return;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
         <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
           <Users size={20} /> Workspace Members
         </h2>
         <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage who has access to this workspace.</p>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
          <input 
            type="email" 
            placeholder="Invite by email..." 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-colors"
          />
          <button 
            onClick={handleInvite}
            disabled={isLoading || !inviteEmail.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors ml-4 shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Invite'}
          </button>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                  {member.user?.name?.[0] || member.user?.email?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {member.user?.name || member.user?.email}
                  </p>
                  <p className="text-xs text-zinc-500">{member.user?.email}</p>
                </div>
              </div>
              <select 
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                className="text-xs font-semibold bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded px-2 py-1 outline-none"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="Remove" className="text-red-500">Remove</option>
              </select>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No members found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Account Security</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your password and security preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Change Password</p>
                <p className="text-xs text-zinc-500">Last changed 3 months ago</p>
              </div>
            </div>
            <button className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300">
              Update
            </button>
          </div>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-xs text-zinc-500">Secure your account with 2FA</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">
              Enable
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Active Sessions</h3>
          <div className="space-y-2">
            {[
              { browser: 'Chrome on Windows', location: 'San Francisco, US', current: true },
              { browser: 'Safari on iPhone', location: 'San Francisco, US', current: false },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-zinc-400" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {session.browser} {session.current && <span className="ml-2 text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 px-1.5 py-0.5 rounded-full">Current</span>}
                    </p>
                    <p className="text-[10px] text-zinc-500">{session.location}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-xs text-red-500 font-medium hover:underline">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Notifications</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Choose how you want to be notified.</p>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Email Notifications', desc: 'Receive daily digests and activity updates.', icon: Bell },
          { title: 'Web Push', desc: 'Real-time alerts in your browser.', icon: Globe },
          { title: 'Slack Integration', desc: 'Send activity to your Slack workspace.', icon: Zap },
        ].map((item, j) => (
          <div key={j} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            </div>
            <div className="w-10 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BillingSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Billing & Plan</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your subscription and billing details.</p>
      </div>

      <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Current Plan</p>
            <h3 className="text-2xl font-black mt-1">Pro Explorer</h3>
          </div>
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">ANNUAL</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-sm font-medium opacity-90">Renews on Jan 12, 2027</div>
          <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
            Manage Subscription
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Payment Methods</h3>
        <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div className="flex items-center gap-3">
             <CreditCard size={20} className="text-zinc-400" />
             <div>
               <p className="text-sm font-semibold text-zinc-900 dark:text-white">Visa ending in 4242</p>
               <p className="text-xs text-zinc-500">Expires 12/28</p>
             </div>
          </div>
          <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">Edit</button>
        </div>
      </div>
    </div>
  );
};

const AdvancedSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Advanced</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Powerful tools for data and account management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <Download size={24} className="text-indigo-500" />
          <h3 className="font-bold text-zinc-900 dark:text-white">Export Data</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Download a complete archive of all your notes, media, and metadata in JSON format.</p>
          <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-bold transition-colors">
            Request Export
          </button>
        </div>
        <div className="p-5 border border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 rounded-2xl space-y-3">
          <Trash2 size={24} className="text-red-500" />
          <h3 className="font-bold text-red-600 dark:text-red-400">Delete Account</h3>
          <p className="text-xs text-red-500/70 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const SettingsPage = () => {
  const { tab } = useParams<{ tab: SettingsTab }>();
  const navigate = useNavigate();
  const activeTab = tab || 'profile';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'workspace', label: 'Workspace', icon: Users },
    { id: 'advanced', label: 'Advanced', icon: RefreshCw },
  ];

  const handleTabChange = (id: string) => {
    navigate(`/settings/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs sm:text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 overflow-hidden">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-b-0 border-zinc-200 dark:border-zinc-800">
            {tabs.map(tabItem => (
              <button
                key={tabItem.id}
                onClick={() => handleTabChange(tabItem.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border-b-2 md:border-b-0 ${
                  activeTab === tabItem.id 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-indigo-500' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white border-transparent'
                }`}
              >
                <tabItem.icon size={18} className={activeTab === tabItem.id ? 'text-indigo-500' : 'text-zinc-400'} />
                {tabItem.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm min-h-[600px]">
          
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'appearance' && <ThemeSettings />}
          {activeTab === 'github' && <GithubSettings />}
          {activeTab === 'workspace' && <WorkspaceSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'advanced' && <AdvancedSettings />}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
