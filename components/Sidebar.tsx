
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const role = user.role;

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Icons.Dashboard, visible: true },
    { id: 'tasks', label: 'المهام', icon: Icons.Tasks, visible: true },
    { id: 'chat', label: 'مركز التواصل', icon: Icons.Office, visible: true },
    { id: 'projects', label: 'إدارة المشاريع', icon: Icons.Building, visible: role === 'Admin' },
    { id: 'employees', label: 'فريق العمل', icon: Icons.Users, visible: role === 'Admin' || role === 'DeptHead' },
  ].filter(item => item.visible);

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-slate-950 text-white flex flex-col z-50 overflow-hidden">
      <div className="p-8">
        <h1 className="text-3xl font-black tracking-tighter text-white">همة <span className="text-[10px] text-violet-400">Enterprise</span></h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
              activeTab === item.id ? 'bg-violet-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <item.icon />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        {deferredPrompt && (
          <button 
            onClick={handleInstall}
            className="w-full py-4 mb-4 rounded-2xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all animate-pulse"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            تثبيت التطبيق (APK/EXE)
          </button>
        )}

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl mb-4">
           <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center font-black text-xs">
              {user.name[0]}
           </div>
           <div className="min-w-0">
              <p className="text-[10px] font-black truncate">{user.name}</p>
              <p className="text-[8px] text-violet-400 font-bold uppercase">{user.role}</p>
           </div>
        </div>
        <button onClick={onLogout} className="w-full py-3 rounded-xl text-rose-400 text-xs font-black hover:bg-rose-500/10 transition-all">خروج</button>
      </div>
    </aside>
  );
};

export default Sidebar;
