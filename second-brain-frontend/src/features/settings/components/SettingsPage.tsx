import { useState } from 'react';
import { User, Palette, Github, Users, Shield, Save, Moon, Sun, Monitor } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useThemeStore } from '@/shared/store/useThemeStore';
import type { ThemeMode } from '@/shared/store/useThemeStore';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'theme' | 'github' | 'workspace';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'theme', label: 'Appearance', icon: Palette },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'workspace', label: 'Workspace', icon: Users },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 placeholder:text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-500' : 'text-zinc-400'} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm min-h-[500px]">
          
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'theme' && <ThemeSettings />}
          {activeTab === 'github' && <GithubSettings />}
          {activeTab === 'workspace' && <WorkspaceSettings />}

        </div>
      </div>
    </div>
  );
};

// --- Tab Components ---

const ProfileSettings = () => {
  const user = useAuthStore(state => state.user);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    toast.success('Profile updated successfully');
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Public Profile</h2>
           <p className="text-sm text-zinc-500 dark:text-zinc-400">This is how others will see you on the platform.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
          <Save size={16} /> Save
        </button>
      </div>
      
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Avatar</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xl border border-indigo-200 dark:border-indigo-800">
              {email.charAt(0).toUpperCase()}
            </div>
            <button className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-colors"
          />
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
            type="text" 
            placeholder="Filter members..." 
            className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-colors"
          />
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors ml-4 shadow-sm">
            Invite
          </button>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                A
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Alex Johnson <span className="text-xs text-zinc-500 font-normal ml-2">(You)</span></p>
                <p className="text-xs text-zinc-500">alex@example.com</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Owner
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                S
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Sarah Chen</p>
                <p className="text-xs text-zinc-500">sarah@example.com</p>
              </div>
            </div>
            <select className="text-xs font-semibold bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded px-2 py-1 outline-none">
              <option>Editor</option>
              <option>Viewer</option>
              <option className="text-red-500">Remove</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
