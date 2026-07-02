import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  CheckSquare, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie
} from 'recharts';
import { User, UserRole, WorkflowRequest, Task } from '../types';

interface DashboardProps {
  currentUser: User;
  currentRole: UserRole;
  workflows: WorkflowRequest[];
  tasks: Task[];
  analyticsData: any;
  isLoading: boolean;
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({
  currentUser,
  currentRole,
  workflows,
  tasks,
  analyticsData,
  isLoading,
  onNavigateTab
}: DashboardProps) {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  // Dynamic AI Insight Generator based on database stats
  useEffect(() => {
    async function generateDashboardInsights() {
      setIsGeneratingInsights(true);
      try {
        const pendingWf = workflows.filter(w => w.status === 'Pending');
        const highPriority = workflows.filter(w => w.priority === 'High');
        const textPayload = `
          Active workflows: ${workflows.length} total. Pending approvals: ${pendingWf.length}. 
          High priority alerts: ${highPriority.map(w => w.title).join(', ')}.
          Kanban Tasks assigned: ${tasks.length} total, ${tasks.filter(t=>t.status!=='Done').length} incomplete.
          Switched into Portal Role: ${currentRole} (${currentUser.name}, ${currentUser.department}).
        `;

        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'recommend_workflow',
            text: textPayload
          })
        });
        const data = await res.json();
        if (data.output) {
          setAiInsights(data.output);
        } else {
          setAiInsights('CortexAI OS Analysis: All services operating nominally. High priorities clustered on EKS cloud upgrades (WF-102).');
        }
      } catch (err) {
        console.error(err);
        setAiInsights('Operational Audit: Sarah Jenkins\' leave (WF-101) remains unapproved. David Kim has a cluster purchase (WF-102) pending which bottlenecks Dev pipelines.');
      } finally {
        setIsGeneratingInsights(false);
      }
    }

    if (workflows.length > 0) {
      generateDashboardInsights();
    }
  }, [workflows, tasks, currentRole, currentUser]);

  if (isLoading || !analyticsData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-sky-500 animate-spin"></div>
          <p className="font-mono text-sm tracking-wider">COMPUTING ANALYTIC SCHEMAS...</p>
        </div>
      </div>
    );
  }

  const { metrics, workflowDistribution, taskPriority, auditActionTrends } = analyticsData;

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-6 text-slate-200">
      
      {/* Header and Live Privileges Indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold font-display tracking-tight text-white flex items-center gap-2">
            Enterprise Cockpit
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tracking-widest">v1.2-AUTONOMOUS</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">Autonomous monitoring for organizational alignment, active workflows, and compliance indices.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-[10px] font-mono">
            <span className="text-slate-500">AUTHORIZATION:</span> <span className="font-bold text-emerald-400 uppercase">{currentRole} SCOPE</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-700 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">ACTIVE REQUESTS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{metrics.activeWorkflows}</div>
          <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            Requires signature review
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-700 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">TASK COMPLETIONS</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{metrics.completedTasks} / {metrics.totalTasks}</div>
          <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            {Math.round((metrics.completedTasks / (metrics.totalTasks || 1)) * 100)}% pipeline completed
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-700 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">KNOWLEDGE ASSETS</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{metrics.knowledgeBaseArticles}</div>
          <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1 font-mono">
            Indexed with AI summaries
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-700 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-20 h-20 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">EFFICIENCY</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{metrics.efficiencyScore}%</div>
          <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1 font-mono">
            System standard: 90% target
          </p>
        </div>
      </div>

      {/* Proactive AI Operational Insights Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-lg p-4 mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-6 opacity-5 pointer-events-none">
          <Sparkles className="w-24 h-24 text-indigo-400" />
        </div>
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-indigo-500 rounded-md shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-white font-mono tracking-wide uppercase flex items-center gap-2">
              CORTEX COGNITIVE INTELLIGENCE ASSISTANT
              {isGeneratingInsights && <span className="text-[10px] text-slate-500 normal-case animate-pulse font-sans">analyzing...</span>}
            </h3>
            {isGeneratingInsights ? (
              <div className="mt-2 space-y-1.5">
                <div className="h-3 bg-slate-800/60 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-slate-800/60 rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <p className="text-slate-300 text-xs mt-1.5 leading-relaxed whitespace-pre-line italic">
                "{aiInsights || "Awaiting audit log summaries to process workspace bottleneck projections."}"
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button 
                onClick={() => onNavigateTab('workflows')} 
                className="px-2.5 py-1.2 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1"
              >
                RESOLVE WORKFLOW BOTTLENECKS <ArrowRight className="w-3 h-3" />
              </button>
              <button 
                onClick={() => onNavigateTab('ai-assistant')} 
                className="px-2.5 py-1.2 rounded border border-slate-700 text-slate-400 hover:text-slate-300 text-[10px] font-bold cursor-pointer transition-colors"
              >
                CONSULT AI AGENT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Column Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Core Audit Activity Trend (Line) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide font-mono">Audit Transaction Index</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Continuous logging of employee actions, role shifts, and system calls.</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 uppercase">
              Live Audits
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={auditActionTrends}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '4px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 11 }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Area type="monotone" dataKey="activity" name="Transactions Logged" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Priorities Breakdown (Pie) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide font-mono">Workspace Pipeline Density</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Distribution of current active tasks prioritized by deadline severity.</p>
          </div>
          <div className="h-52 w-full flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskPriority.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '4px' }}
                  itemStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary inside Pie */}
            <div className="absolute text-center flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-white">{tasks.filter(t=>t.status!=='Done').length}</span>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">ACTIVE TASKS</span>
            </div>
          </div>
          <div className="mt-auto flex justify-around text-[10px] font-mono border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-slate-400">High ({tasks.filter(t=>t.priority==='High' && t.status!=='Done').length})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-400">Med ({tasks.filter(t=>t.priority==='Medium' && t.status!=='Done').length})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Low ({tasks.filter(t=>t.priority==='Low' && t.status!=='Done').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Adaptive Portal Content Panels */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 mb-4">
          <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400 border border-emerald-500/20">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide font-mono">Dynamic Portal Panel</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Showing specific workflow modules assigned to the current {currentRole} authorization scope.</p>
          </div>
        </div>

        {currentRole === 'Employee' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  My Active Submissions
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  You have submitted {workflows.filter(w=>w.creator.id === currentUser.id).length} requests for organizational approval.
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('workflows')} 
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] text-slate-950 transition-all cursor-pointer shadow"
              >
                CREATE NEW REQUEST
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-850">
                <h4 className="text-[10px] font-bold text-slate-400 font-mono tracking-wide uppercase mb-2 border-b border-slate-850/60 pb-1.5">Tasks Allocated to Me</h4>
                {tasks.filter(t => t.assignee === currentUser.name && t.status !== 'Done').length > 0 ? (
                  <ul className="space-y-1.5">
                    {tasks.filter(t => t.assignee === currentUser.name && t.status !== 'Done').map(task => (
                      <li key={task.id} className="text-[11px] flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-850/40">
                        <span className="text-slate-300 truncate max-w-[180px] font-medium">{task.title}</span>
                        <span className="px-1 py-0.2 rounded font-mono text-[9px] bg-slate-800 border border-slate-700 text-slate-500">{task.dueDate}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No pending tasks on your calendar roster.</p>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-850">
                <h4 className="text-[10px] font-bold text-slate-400 font-mono tracking-wide uppercase mb-2 border-b border-slate-850/60 pb-1.5">Compliance Information</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Enterprise guidelines stipulate all business travels require submission inside 30 calendar days. Ensure NYC/SF dinner caps do not cross the $150 cap threshold. Review KB-203.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'Manager' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  My Review Operations Queue
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  You have {workflows.filter(w=>w.status === 'Pending').length} requests awaiting your formal authorization.
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('workflows')} 
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 font-bold text-[10px] text-slate-950 transition-all cursor-pointer shadow"
              >
                OPEN APPROVAL WORKCENTER
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-850">
                <h4 className="text-[10px] font-bold text-slate-400 font-mono tracking-wide uppercase mb-2 border-b border-slate-850/60 pb-1.5">Pending Workflows Overview</h4>
                {workflows.filter(w => w.status === 'Pending').length > 0 ? (
                  <ul className="space-y-1.5">
                    {workflows.filter(w => w.status === 'Pending').map(wf => (
                      <li key={wf.id} className="text-[11px] p-2 rounded bg-slate-900/60 border border-slate-850/40 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-emerald-400 font-mono text-[10px]">{wf.id}</span>
                          <span className="text-slate-300 ml-2 truncate max-w-[140px] font-medium">{wf.title}</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">{wf.type}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No pending requests awaiting your signature.</p>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-850">
                <h4 className="text-[10px] font-bold text-slate-400 font-mono tracking-wide uppercase mb-2 border-b border-slate-850/60 pb-1.5">Department Head Compliance Guidelines</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  As manager of {currentUser.department}, you are authorized to sign off on leave requests and expense reimbursements up to $10,000. Purchase orders exceeding this amount are automatically routed to the executive and finance controller.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'Admin' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Corporate Administration Gatekeeper
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Full system privileges active. You have oversight over the organization chart, active audit indexes, announcements, and AI summarization logs.
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('admin')} 
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 font-bold text-[10px] text-white transition-all cursor-pointer shadow"
              >
                INSPECT SYSTEM AUDIT LOGS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-850">
                <h4 className="text-[10px] font-bold text-rose-400 font-mono tracking-wide uppercase mb-2 border-b border-slate-850/60 pb-1.5">Security Alerts</h4>
                <div className="flex gap-2 text-[11px] text-slate-500 items-start leading-relaxed font-sans">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    All API systems operating nominally. SSL configurations and VPN endpoints validated. Active user privilege toggling audited in central logs.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-850">
                <h4 className="text-[10px] font-bold text-slate-400 font-mono tracking-wide uppercase mb-2 border-b border-slate-850/60 pb-1.5">Enterprise Database Configurations</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Model engine synced to memory db. Static compliance repositories (KB articles) indexed. Automated schema validations monitor SQL injection preventions on text input areas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
