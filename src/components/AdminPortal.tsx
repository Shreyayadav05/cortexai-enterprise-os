import { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Activity, 
  Settings, 
  Server, 
  Lock, 
  Users, 
  Globe,
  Database,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { User, UserRole, AuditLog } from '../types';

interface AdminPortalProps {
  currentUser: User;
  currentRole: UserRole;
  auditLogs: AuditLog[];
  directory: User[];
  onRefreshLogs: () => void;
}

export default function AdminPortal({
  currentUser,
  currentRole,
  auditLogs,
  directory,
  onRefreshLogs
}: AdminPortalProps) {
  const [logSearch, setLogSearch] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('All');

  // Security Policy Toggles Simulated State
  const [mfaMandatory, setMfaMandatory] = useState<boolean>(true);
  const [redisCaching, setRedisCaching] = useState<boolean>(true);
  const [sqlInjectionShield, setSqlInjectionShield] = useState<boolean>(true);
  const [rateLimiting, setRateLimiting] = useState<boolean>(true);

  const actions = ['All', 'BOOT', 'ROLE_SWITCH', 'WORKFLOW_CREATE', 'WORKFLOW_APPROVE', 'KNOWLEDGE_CREATE', 'TASK_CREATE', 'CALENDAR_CREATE'];

  const filteredLogs = auditLogs.filter(log => {
    const searchMatch = log.user.toLowerCase().includes(logSearch.toLowerCase()) || 
                        log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
                        log.ipAddress.includes(logSearch);
    const actionMatch = selectedAction === 'All' || log.action === selectedAction;
    return searchMatch && actionMatch;
  });

  if (currentRole !== 'Admin') {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-5 text-slate-400">
        <div className="max-w-md text-center p-5 bg-slate-900 border border-slate-800 rounded flex flex-col items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-200">Access Denied (403 Forbidden)</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            You are currently authenticated with the "{currentRole}" security scope. Only accounts with the "Admin" role can authorize system audit indices or configuration parameters.
          </p>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 text-[10px] text-slate-500 font-mono leading-normal">
            Switch demo privileges in the bottom of the sidebar to Marcus Vance (Admin) to view this console.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-5 text-slate-200 flex flex-col lg:flex-row gap-5 text-xs">
      
      {/* Left pane - Audit Log List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
              Central Administrative Console
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono uppercase">Secured</span>
            </h2>
            <p className="text-slate-400 text-[11px] mt-0.5">Audit log indices, system capabilities configurations, security parameter switches, and user authorizations roster.</p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-slate-900 border border-slate-800 rounded p-3 mb-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs (Details, User, IP)..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded py-1 pl-7 pr-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-sans"
              />
              <Search className="absolute left-2 top-2 w-3 h-3 text-slate-500" />
            </div>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded py-1 px-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              {actions.map(act => (
                <option key={act} value={act}>{act === 'All' ? 'All Actions' : act}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={onRefreshLogs}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-750 rounded font-bold text-[10px] uppercase text-slate-300 cursor-pointer transition-colors"
          >
            Refresh Log Cache
          </button>
        </div>

        {/* Logs Table list */}
        <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden">
          <div className="p-2.5 bg-slate-950 border-b border-slate-800 text-[10px] font-mono font-bold text-slate-400 grid grid-cols-12 gap-2">
            <div className="col-span-3">TIMESTAMP</div>
            <div className="col-span-2">USER</div>
            <div className="col-span-2">ACTION</div>
            <div className="col-span-3">DETAILS</div>
            <div className="col-span-2">IP ADDRESS</div>
          </div>

          <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto pr-1">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-2.5 text-[11px] font-mono text-slate-300 grid grid-cols-12 gap-2 items-center hover:bg-slate-850/30 transition-colors">
                <div className="col-span-3 text-slate-500 text-[10px]">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="col-span-2 font-bold flex flex-col">
                  <span className="text-slate-200">{log.user}</span>
                  <span className="text-[9px] text-slate-500 font-normal uppercase">{log.role}</span>
                </div>
                <div className="col-span-2">
                  <span className={`px-1 py-0.5 rounded text-[8px] font-bold border ${
                    log.action === 'BOOT' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    log.action === 'ROLE_SWITCH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    log.action.includes('APPROVE') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    {log.action}
                  </span>
                </div>
                <div className="col-span-3 text-slate-300 pr-2 leading-relaxed">
                  {log.details}
                </div>
                <div className="col-span-2 text-slate-500 text-[10px]">
                  {log.ipAddress}
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-10 text-center text-slate-500 font-mono">
                NO AUDIT LOG RECORDS FOUND.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right pane - Configurations / Active Directory */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        
        {/* Security / Capability Configurations */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3.5">
          <h3 className="text-[10px] font-bold font-mono tracking-wider text-slate-300 uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Security Switches
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-200">Force Token MFA</span>
                <span className="text-[9px] text-slate-500 font-mono">Active in Security Vault</span>
              </div>
              <input
                type="checkbox"
                checked={mfaMandatory}
                onChange={(e) => setMfaMandatory(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-200">Redis Cache Sessions</span>
                <span className="text-[9px] text-slate-500 font-mono">JWT authorization TTL</span>
              </div>
              <input
                type="checkbox"
                checked={redisCaching}
                onChange={(e) => setRedisCaching(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-200">SQL Sanitization Shield</span>
                <span className="text-[9px] text-slate-500 font-mono font-mono">Anti-SQL Injection Guard</span>
              </div>
              <input
                type="checkbox"
                checked={sqlInjectionShield}
                onChange={(e) => setSqlInjectionShield(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-200">Nginx Rate Limit</span>
                <span className="text-[9px] text-slate-500 font-mono">DDoS compliance throttle</span>
              </div>
              <input
                type="checkbox"
                checked={rateLimiting}
                onChange={(e) => setRateLimiting(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* System Health Capabilities Check */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <h3 className="text-[10px] font-bold font-mono tracking-wider text-slate-300 uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" /> Capabilities Registry
          </h3>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Spring Boot MVC: <strong className="text-emerald-400 font-bold">Active</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Google Gemini API: <strong className="text-emerald-400 font-bold">Live</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>D3/Recharts Engine: <strong className="text-emerald-400 font-bold">Uptime</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>XSS Sanitizers: <strong className="text-emerald-400 font-bold">Protected</strong></span>
            </div>
          </div>
        </div>

        {/* Directory Access */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <h3 className="text-[10px] font-bold font-mono tracking-wider text-slate-300 uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> LDAP Directory
          </h3>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {directory.map(u => (
              <div key={u.id} className="flex gap-2 items-center text-xs">
                <div className="w-6 h-6 rounded-sm bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-[10px] uppercase shrink-0 font-mono">
                  {u.name.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-200 truncate leading-tight">{u.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono truncate uppercase">{u.role} // {u.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
