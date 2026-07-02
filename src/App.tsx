import { useEffect, useState } from 'react';
import { 
  Bell, 
  Menu, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkflowEngine from './components/WorkflowEngine';
import KnowledgeBase from './components/KnowledgeBase';
import AiAssistant from './components/AiAssistant';
import CollaborationHub from './components/CollaborationHub';
import OrgChart from './components/OrgChart';
import AdminPortal from './components/AdminPortal';
import { User, UserRole, WorkflowRequest, KnowledgeArticle, Task, ChatMessage, CalendarEvent, Announcement, AuditLog } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Enterprise Datasets
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [directory, setDirectory] = useState<User[]>([]);
  
  const [workflows, setWorkflows] = useState<WorkflowRequest[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Global Loader
  async function fetchEnterpriseData() {
    setIsRefreshing(true);
    try {
      // 1. Fetch Session
      const userRes = await fetch('/api/user');
      const userData = await userRes.json();
      setCurrentUser(userData.currentUser);
      setCurrentRole(userData.currentRole);
      setDirectory(userData.directory);

      // 2. Fetch Datasets
      const [
        wfRes,
        artRes,
        tskRes,
        chatRes,
        calRes,
        annRes,
        logRes,
        analyticsRes
      ] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/articles'),
        fetch('/api/tasks'),
        fetch('/api/chat'),
        fetch('/api/calendar'),
        fetch('/api/announcements'),
        fetch('/api/audit-logs'),
        fetch('/api/analytics')
      ]);

      setWorkflows(await wfRes.json());
      setArticles(await artRes.json());
      setTasks(await tskRes.json());
      setChatMessages(await chatRes.json());
      setCalendarEvents(await calRes.json());
      setAnnouncements(await annRes.json());
      setAuditLogs(await logRes.json());
      setAnalyticsData(await analyticsRes.json());

    } catch (err) {
      console.error('Failed to align enterprise endpoints:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  // Demo user toggling trigger
  async function handleSwitchUser(userId: string) {
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        await fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (isLoading || !currentUser) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-500/10 animate-pulse">
            C
          </div>
          <p className="font-mono text-xs tracking-widest uppercase animate-pulse">ALIGNED CORE ROUTING SYSTEMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-slate-950 flex overflow-hidden font-sans antialiased text-slate-200">
      
      {/* Sidebar Component */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        currentUser={currentUser}
        currentRole={currentRole}
        directory={directory}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Panel Content Box */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top bar header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Menu className="w-5 h-5 text-slate-500 md:hidden cursor-pointer" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">WORKSPACE ROUTING</span>
              <span className="text-slate-600 font-mono text-xs">/</span>
              <span className="text-xs font-mono text-indigo-400 font-semibold tracking-wide uppercase">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync trigger */}
            <button
              onClick={fetchEnterpriseData}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer text-slate-400 transition-colors flex items-center justify-center"
              title="Sync Enterprise State"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* Notification alert bell */}
            <div className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer text-slate-400 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            </div>

            {/* Verification Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SSL SECURED
            </div>
          </div>
        </header>

        {/* Dynamic Content Panel View Router */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {currentTab === 'dashboard' && (
            <Dashboard 
              currentUser={currentUser}
              currentRole={currentRole}
              workflows={workflows}
              tasks={tasks}
              analyticsData={analyticsData}
              isLoading={isLoading}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'workflows' && (
            <WorkflowEngine 
              currentUser={currentUser}
              currentRole={currentRole}
              workflows={workflows}
              onRefreshWorkflows={fetchEnterpriseData}
            />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeBase 
              currentUser={currentUser}
              currentRole={currentRole}
              articles={articles}
              onRefreshArticles={fetchEnterpriseData}
              isLoading={isLoading}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AiAssistant 
              currentUser={currentUser}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'collaboration' && (
            <CollaborationHub 
              currentUser={currentUser}
              currentRole={currentRole}
              tasks={tasks}
              chatMessages={chatMessages}
              calendarEvents={calendarEvents}
              announcements={announcements}
              onRefreshTasks={fetchEnterpriseData}
              onRefreshChat={fetchEnterpriseData}
              onRefreshCalendar={fetchEnterpriseData}
              onRefreshAnnouncements={fetchEnterpriseData}
            />
          )}

          {currentTab === 'org-chart' && (
            <OrgChart />
          )}

          {currentTab === 'admin' && (
            <AdminPortal 
              currentUser={currentUser}
              currentRole={currentRole}
              auditLogs={auditLogs}
              directory={directory}
              onRefreshLogs={fetchEnterpriseData}
            />
          )}
        </main>
      </div>

    </div>
  );
}
