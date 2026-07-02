import { 
  LayoutDashboard, 
  Cpu, 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  Users, 
  ShieldAlert, 
  Activity, 
  UserCheck 
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  currentRole: UserRole;
  directory: User[];
  onSwitchUser: (userId: string) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentUser,
  currentRole,
  directory,
  onSwitchUser
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, category: 'CORE ENGINE' },
    { id: 'workflows', name: 'Workflow Engine', icon: Cpu, category: 'CORE ENGINE' },
    { id: 'knowledge', name: 'Knowledge Base', icon: BookOpen, category: 'CORE ENGINE' },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Sparkles, category: 'INTELLIGENCE' },
    { id: 'collaboration', name: 'Collaboration Hub', icon: MessageSquare, category: 'COLLABORATION' },
    { id: 'org-chart', name: 'Organization Chart', icon: Users, category: 'COLLABORATION' },
    { id: 'admin', name: 'Admin & Audit Logs', icon: ShieldAlert, category: 'ADMINISTRATION' },
  ];

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <aside className="w-56 bg-slate-900/50 border-r border-slate-800 text-slate-300 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
          CX
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-1">
            Cortex<span className="text-emerald-400">AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Status: Online"></span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest">v1.0.4-PROD</p>
        </div>
      </div>

      {/* User Card Display */}
      <div className="p-3 mx-2 my-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full border border-slate-750 overflow-hidden shrink-0">
          <img 
            src={currentUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.name}`} 
            alt={currentUser.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`px-1 py-0.2 text-[8px] font-bold rounded tracking-wide uppercase border ${
              currentRole === 'Admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              currentRole === 'Manager' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {currentRole}
            </span>
            <span className="text-[9px] text-slate-500 truncate max-w-[70px] font-mono">{currentUser.department}</span>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {categories.map(category => (
          <div key={category} className="space-y-1">
            <h3 className="px-2 text-[9px] font-bold tracking-wider text-slate-500 uppercase font-mono">
              {category}
            </h3>
            <ul className="space-y-0.5">
              {menuItems
                .filter(item => item.category === category)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setCurrentTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>{item.name}</span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Interactive Role Privileges Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5 text-slate-500">
          <UserCheck className="w-3 h-3" />
          <span className="text-[9px] font-mono tracking-wider font-bold uppercase">DEMO PRIVILEGES</span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => onSwitchUser(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded py-1 px-2 text-[10px] font-medium text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors duration-150 cursor-pointer"
        >
          {directory.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
