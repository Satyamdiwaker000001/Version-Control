import { useState, useEffect } from 'react';
import { AvatarModal } from './profile/AvatarModal';
import { cn } from '@/shared/utils/cn';
import { 
  User, Palette, Github, Users, Shield, Save, 
  Moon, Sun, Monitor, RefreshCw, Lock, Bell,
  CreditCard, Trash2, Download, Globe, Zap,
  Mail, Check,
  Sparkles, Leaf, Gem, Waves,
  Cloud, Sunset, Coffee, Flame, Cpu
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import type { ThemeMode } from '@/shared/store/useThemeStore';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';

type SettingsTab = 'profile' | 'appearance' | 'github' | 'workspace' | 'security' | 'notifications' | 'billing' | 'advanced';

const ProfileSettings = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const email = user?.email || '';

  const handleSave = async () => {
    try {
      await updateProfile({ name });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    try {
      await updateProfile({ avatar: avatarUrl });
      toast.success('Avatar updated successfully');
      setIsGalleryOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update avatar');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-lg font-bold text-foreground">Public Profile</h2>
           <p className="text-sm text-muted-foreground">This is how others will see you on Noetic.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={16} />} 
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Avatar</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-xl uppercase">
                  {email.charAt(0)}
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="px-3 py-1.5 border border-border rounded text-sm font-medium text-foreground/80 hover:bg-accent transition-colors"
            >
              Change Avatar
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Display Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 text-foreground transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors cursor-not-allowed"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed.</p>
        </div>
      </div>

      <AnimatePresence>
        {isGalleryOpen && (
          <AvatarModal 
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            onSelect={handleAvatarSelect}
            currentAvatar={user?.avatar}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ThemeSettings = () => {
  const { themeMode, setTheme } = useThemeStore();

  const handleSetTheme = (mode: ThemeMode) => {
    setTheme(mode);
    toast.success(`Theme set to ${mode}`);
  };

  const THEMES: { id: ThemeMode; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'light', label: 'Light', icon: Sun, color: 'bg-white border-zinc-200', desc: 'Standard clean light mode' },
    { id: 'dark', label: 'Dark', icon: Moon, color: 'bg-zinc-900 border-zinc-800', desc: 'Classic professional dark mode' },
    { id: 'midnight', label: 'Midnight', icon: Sparkles, color: 'bg-slate-950 border-slate-900', desc: 'Deep slate blue for focused work' },
    { id: 'forest', label: 'Forest', icon: Leaf, color: 'bg-emerald-950 border-emerald-900', desc: 'Serene nature-inspired dark theme' },
    { id: 'quartz', label: 'Quartz', icon: Gem, color: 'bg-rose-50 border-rose-100', desc: 'Elegant light theme with rose accents' },
    { id: 'emerald', label: 'Emerald', icon: Waves, color: 'bg-emerald-50 border-emerald-100', desc: 'Clean mint theme with teal focus' },
    { id: 'nord', label: 'Nord', icon: Cloud, color: 'bg-[#2E3440] border-[#3B4252]', desc: 'Arctic-inspired modern dark mode' },
    { id: 'sunset', label: 'Sunset', icon: Sunset, color: 'bg-[#1A103D] border-[#2D1B69]', desc: 'Warm deep violet for evening flow' },
    { id: 'coffee', label: 'Coffee', icon: Coffee, color: 'bg-[#FCF5E5] border-[#E6D5B8]', desc: 'Cozy latte tones for soft reading' },
    { id: 'crimson', label: 'Crimson', icon: Flame, color: 'bg-[#0F0202] border-[#2D0A0A]', desc: 'Bold deep red charcoal aesthetic' },
    { id: 'steel', label: 'Steel', icon: Cpu, color: 'bg-[#F0F2F5] border-[#D1D9E0]', desc: 'Technical cool gray for engineers' },
    { id: 'system', label: 'System', icon: Monitor, color: 'bg-gradient-to-br from-white to-zinc-900 border-zinc-300', desc: 'Follows your system preferences' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
         <h2 className="text-xl font-black text-foreground tracking-tight">Interface Style</h2>
         <p className="text-sm text-muted-foreground font-medium">Choose a color palette that matches your cognitive flow.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => handleSetTheme(t.id)}
            className={cn(
              "group relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left",
              themeMode === t.id
                ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-md scale-[1.02]"
                : "border-border hover:border-border/80 hover:bg-accent/50 hover:shadow-sm"
            )}
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-inner", t.color)}>
              <t.icon size={24} className={themeMode === t.id ? "text-primary" : "text-muted-foreground"} />
            </div>
            
            <div className="space-y-1">
              <span className={cn("font-bold text-sm block", themeMode === t.id ? "text-primary" : "text-foreground")}>
                {t.label}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium leading-tight">
                {t.desc}
              </span>
            </div>

            {themeMode === t.id && (
              <div className="absolute top-3 right-3 text-primary">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const GithubSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
         <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
           <Github size={20} /> GitHub Integration
         </h2>
         <p className="text-sm text-muted-foreground">Manage your connected GitHub accounts and repositories.</p>
      </div>

      <div className="border border-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div>
           <p className="font-semibold text-foreground">Connected Account</p>
           <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <Shield size={14} /> Authenticated successfully
           </p>
         </div>
         <button className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors text-foreground/80">
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
         <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
           <Users size={20} /> Workspace Members
         </h2>
         <p className="text-sm text-muted-foreground">Manage who has access to this workspace.</p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted/30 flex justify-between items-center border-b border-border">
          <input 
            type="email" 
            placeholder="Invite by email..." 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full max-w-xs bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 text-foreground transition-colors"
          />
          <button 
            onClick={handleInvite}
            disabled={isLoading || !inviteEmail.trim()}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium transition-colors ml-4 shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Invite'}
          </button>
        </div>
        <div className="divide-y divide-border">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                  {member.user?.name?.[0] || member.user?.email?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {member.user?.name || member.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                </div>
              </div>
              <select 
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                className="text-xs font-semibold bg-background border border-border text-foreground rounded px-2 py-1 outline-none"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="Remove" className="text-destructive">Remove</option>
              </select>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
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
        <h2 className="text-lg font-bold text-foreground">Account Security</h2>
        <p className="text-sm text-muted-foreground">Manage your password and security preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
              </div>
            </div>
            <button className="px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors text-foreground/80">
              Update
            </button>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Secure your account with 2FA</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Enable
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Active Sessions</h3>
          <div className="space-y-2">
            {[
              { browser: 'Chrome on Windows', location: 'San Francisco, US', current: true },
              { browser: 'Safari on iPhone', location: 'San Francisco, US', current: false },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {session.browser} {session.current && <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold">Current</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{session.location}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-xs text-destructive font-bold hover:underline">Revoke</button>
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
  const { preferences, fetchPreferences, updatePreferences } = useNotificationStore();

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  if (!preferences) return null;

  const handleToggle = (category: keyof typeof preferences, key: string) => {
    const section = preferences[category] as any;
    updatePreferences({
      [category]: {
        ...section,
        [key]: !section[key]
      }
    });
    toast.success('Notification settings updated');
  };

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={cn(
        "w-10 h-5 rounded-full relative transition-colors duration-200 outline-none",
        active ? "bg-primary" : "bg-muted"
      )}
    >
      <motion.div 
        animate={{ x: active ? 22 : 2 }}
        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Manage how and when you receive updates.</p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Mail size={16} className="text-primary" /> Email Subscriptions
        </h3>
        <div className="grid gap-3">
          {[
            { id: 'dailyDigest', title: 'Daily Digest', desc: 'A summary of your workspace activity sent every morning.' },
            { id: 'activityUpdates', title: 'Activity Updates', desc: 'Real-time emails for mentions and important changes.' },
            { id: 'marketing', title: 'Product Updates', desc: 'News about new features and product improvements.' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card/50">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Toggle 
                active={(preferences.email as any)[item.id]} 
                onClick={() => handleToggle('email', item.id)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Globe size={16} className="text-primary" /> Browser Push
        </h3>
        <div className="grid gap-3">
           <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card/50">
            <div>
              <p className="text-sm font-semibold text-foreground">Enable Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive alerts directly in your browser even when the tab is closed.</p>
            </div>
            <Toggle 
              active={preferences.push.enabled} 
              onClick={() => handleToggle('push', 'enabled')} 
            />
          </div>
          {preferences.push.enabled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pl-4 space-y-3 overflow-hidden"
            >
              {[
                { id: 'mentions', title: 'Mentions & Replies', desc: 'When someone tags you in a note or comment.' },
                { id: 'nodeUpdates', title: 'Note Changes', desc: 'When a note you are watching is modified.' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card/50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Toggle 
                    active={(preferences.push as any)[item.id]} 
                    onClick={() => handleToggle('push', item.id)} 
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Sslack Integration */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Zap size={16} className="text-primary" /> Sslack Integration
        </h3>
        <div className="p-4 border border-border rounded-xl bg-card/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Connect to Sslack</p>
              <p className="text-xs text-muted-foreground">Stream activity and alerts to a Sslack channel.</p>
            </div>
            <Toggle 
              active={preferences.sslack.enabled} 
              onClick={() => handleToggle('sslack', 'enabled')} 
            />
          </div>
          {preferences.sslack.enabled && (
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Sslack Webhook URL / Channel</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="https://hooks.slack.com/services/..."
                  value={preferences.sslack.channel}
                  onChange={(e) => updatePreferences({ sslack: { ...preferences.sslack, channel: e.target.value } })}
                  className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                />
                <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors">
                  Test
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const BillingSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Billing & Plan</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing details.</p>
      </div>

      <div className="p-6 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-primary-foreground shadow-lg">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Current Plan</p>
            <h3 className="text-2xl font-black mt-1">Pro Explorer</h3>
          </div>
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">ANNUAL</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-sm font-medium opacity-90">Renews on Jan 12, 2027</div>
          <button className="px-4 py-2 bg-background text-foreground rounded-lg text-sm font-bold hover:bg-background/90 transition-colors">
            Manage Subscription
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Payment Methods</h3>
        <div className="flex items-center justify-between p-4 border border-border rounded-xl">
          <div className="flex items-center gap-3">
             <CreditCard size={20} className="text-muted-foreground" />
             <div>
               <p className="text-sm font-semibold text-foreground">Visa ending in 4242</p>
               <p className="text-xs text-muted-foreground">Expires 12/28</p>
             </div>
          </div>
          <button className="text-xs text-muted-foreground hover:text-foreground font-bold">Edit</button>
        </div>
      </div>
    </div>
  );
};

const AdvancedSettings = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground">Advanced</h2>
        <p className="text-sm text-muted-foreground">Powerful tools for data and account management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 border border-border rounded-2xl space-y-3">
          <Download size={24} className="text-primary" />
          <h3 className="font-bold text-foreground">Export Data</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Download a complete archive of all your notes, media, and metadata in JSON format.</p>
          <button className="w-full py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold transition-colors">
            Request Export
          </button>
        </div>
        <div className="p-5 border border-destructive/20 bg-destructive/5 rounded-2xl space-y-3">
          <Trash2 size={24} className="text-destructive" />
          <h3 className="font-bold text-destructive">Delete Account</h3>
          <p className="text-xs text-destructive/70 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="w-full py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg text-xs font-bold transition-colors shadow-sm">
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 overflow-hidden">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-b-0 border-border mask-fade-right">
            {tabs.map(tabItem => (
              <button
                key={tabItem.id}
                onClick={() => handleTabChange(tabItem.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border-b-2 md:border-b-0 ${
                  activeTab === tabItem.id 
                    ? 'bg-accent text-foreground border-primary' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground border-transparent'
                }`}
              >
                <tabItem.icon size={18} className={activeTab === tabItem.id ? 'text-primary' : 'text-muted-foreground'} />
                <span className="truncate">{tabItem.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm min-h-[600px]">
          
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
