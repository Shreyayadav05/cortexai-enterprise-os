import { useState, FormEvent } from 'react';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Briefcase, 
  FileText,
  User as UserIcon,
  Calendar,
  AlertTriangle,
  Send,
  Bell
} from 'lucide-react';
import { User, UserRole, WorkflowRequest, WorkflowType, WorkflowStatus } from '../types';

interface WorkflowEngineProps {
  currentUser: User;
  currentRole: UserRole;
  workflows: WorkflowRequest[];
  onRefreshWorkflows: () => void;
}

export default function WorkflowEngine({
  currentUser,
  currentRole,
  workflows,
  onRefreshWorkflows
}: WorkflowEngineProps) {
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRequest | null>(null);
  
  // Submit Form States
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<WorkflowType>('Leave');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [amount, setAmount] = useState<string>('');
  const [dept, setDept] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Approval Form States
  const [comment, setComment] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Notification Feed Simulation
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string }>>([
    { id: '1', text: 'Sarah Jenkins created Annual Summer Leave Request (WF-101)', time: '3 hours ago' },
    { id: '2', text: 'David Kim submitted Cloud Server Migration purchase order (WF-102)', time: '1 hour ago' },
  ]);

  const addNotification = (text: string) => {
    setNotifications(prev => [
      { id: Date.now().toString(), text, time: 'Just now' },
      ...prev.slice(0, 4) // Keep last 5
    ]);
  };

  // Create workflow request
  async function handleCreateWorkflow(e: FormEvent) {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          priority,
          amount: amount ? Number(amount) : undefined,
          department: dept || undefined,
          description
        })
      });
      const data = await res.json();
      if (res.ok) {
        onRefreshWorkflows();
        addNotification(`New ${type} request created: "${title}" by ${currentUser.name}`);
        // Reset
        setTitle('');
        setAmount('');
        setDept('');
        setDescription('');
        setIsCreateOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Approve action
  async function handleApprove(id: string) {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/workflows/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      const data = await res.json();
      if (res.ok) {
        onRefreshWorkflows();
        setSelectedWorkflow(data);
        addNotification(`Request ${id} approved by ${currentUser.name}`);
        setComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  }

  // Reject action
  async function handleReject(id: string) {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/workflows/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      const data = await res.json();
      if (res.ok) {
        onRefreshWorkflows();
        setSelectedWorkflow(data);
        addNotification(`Request ${id} rejected by ${currentUser.name}`);
        setComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  }

  // Filtered lists
  const filteredWorkflows = workflows.filter(w => {
    const typeMatch = filterType === 'All' || w.type === filterType;
    const statusMatch = filterStatus === 'All' || w.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getPriorityColor = (p: string) => {
    if (p === 'High') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  };

  const getStatusIcon = (s: WorkflowStatus) => {
    if (s === 'Approved') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (s === 'Rejected') return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    return <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
  };

  const getStatusColor = (s: WorkflowStatus) => {
    if (s === 'Approved') return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    if (s === 'Rejected') return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
    return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-6 text-slate-200 flex flex-col lg:flex-row gap-6">
      
      {/* Main Grid left */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold font-display tracking-tight text-white flex items-center gap-2">
              Autonomous Approval Center
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tracking-widest">BPMN-ACTIVE</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Submit, monitor, and sign-off on Leave, Expense, and Purchase proposals with full security tracking.</p>
          </div>
          
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] text-slate-950 rounded uppercase tracking-wide transition-all cursor-pointer shadow flex items-center gap-1.5 self-start"
          >
            <PlusCircle className="w-3.5 h-3.5" /> CREATE REQUEST
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-[9px] font-bold font-mono text-slate-500 uppercase mb-1">Workflow Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded py-1 px-2 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="All">All Categories</option>
                <option value="Leave">Leave requests</option>
                <option value="Purchase">Purchase orders</option>
                <option value="Expense">Expense reimbursements</option>
                <option value="Recruitment">Recruitment orders</option>
                <option value="Document">Document approval</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold font-mono text-slate-500 uppercase mb-1">Approval Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded py-1 px-2 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            Showing <span className="font-bold text-emerald-400">{filteredWorkflows.length}</span> matching requests
          </div>
        </div>

        {/* Workflows List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkflows.map(wf => (
            <div
              key={wf.id}
              onClick={() => setSelectedWorkflow(wf)}
              className={`p-4 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                selectedWorkflow?.id === wf.id 
                  ? 'bg-slate-850 border-emerald-500/50 shadow shadow-emerald-500/5'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-750 hover:bg-slate-850/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{wf.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wide font-mono ${
                      wf.type === 'Leave' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      wf.type === 'Purchase' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      wf.type === 'Expense' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    }`}>
                      {wf.type}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex items-center gap-1 border ${getStatusColor(wf.status)}`}>
                    {getStatusIcon(wf.status)}
                    {wf.status}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-100 group-hover:text-white line-clamp-1">{wf.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 h-8 leading-relaxed font-sans">{wf.description}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{wf.creator.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1 py-0.2 text-[8px] rounded uppercase font-bold border ${getPriorityColor(wf.priority)}`}>
                    {wf.priority}
                  </span>
                  {wf.amount && (
                    <span className="text-slate-300 font-bold">${wf.amount.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredWorkflows.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-500 font-mono text-xs">
              NO WORKFLOWS IN PIPELINE ALIGNED TO ACTIVE FILTERS.
            </div>
          )}
        </div>
      </div>

      {/* Slide Sidebar right - Detail Audit tracker */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        
        {/* Selected Workflow Auditor Box */}
        {selectedWorkflow ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
            <h3 className="text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase border-b border-slate-800 pb-2 mb-3">
              Proposal Auditor Center
            </h3>

            <div className="space-y-4 flex-1">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">SUBMITTER DETAILS</span>
                <p className="text-xs font-bold text-white mt-0.5">{selectedWorkflow.creator.name}</p>
                <p className="text-[9px] text-slate-400 font-mono">{selectedWorkflow.creator.department} / {selectedWorkflow.creator.role}</p>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">DESCRIPTION</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-line font-sans">{selectedWorkflow.description}</p>
              </div>

              {/* Dynamic BPMN Progress Pipeline */}
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-2">BPMN Chain Tracking</span>
                <div className="relative pl-5 space-y-3.5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-black text-slate-950">1</span>
                    <p className="text-[11px] font-bold text-slate-200">Initiation Passed</p>
                    <p className="text-[9px] text-slate-500 font-mono">{selectedWorkflow.submissionDate}</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative">
                    <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                      selectedWorkflow.status === 'Approved' ? 'bg-emerald-500 text-slate-950' : 
                      selectedWorkflow.status === 'Rejected' ? 'bg-rose-500 text-white' : 
                      'bg-amber-500/30 text-amber-400 border border-amber-500/25 animate-pulse'
                    }`}>2</span>
                    <p className="text-[11px] font-bold text-slate-200">Department Audit Gate</p>
                    <p className="text-[9px] text-slate-500 font-mono">Assigned to: {selectedWorkflow.currentAssignee}</p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                      selectedWorkflow.status === 'Approved' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}>3</span>
                    <p className="text-[11px] font-bold text-slate-200">Finance Verification</p>
                    <p className="text-[9px] text-slate-500 font-mono">Final execution release</p>
                  </div>
                </div>
              </div>

              {/* Action Log History */}
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1.5">History Records</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedWorkflow.logs.map(log => (
                    <div key={log.id} className="p-2 bg-slate-950/40 rounded border border-slate-800 text-[10px]">
                      <div className="flex justify-between font-mono text-slate-400">
                        <span className="font-bold text-slate-300">{log.user} ({log.action})</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {log.comment && <p className="text-slate-400 mt-1 italic leading-tight">"{log.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Workspace for Managers/Admins */}
              {selectedWorkflow.status === 'Pending' && (currentRole === 'Manager' || currentRole === 'Admin') ? (
                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Verification Comments</span>
                  <textarea
                    rows={2}
                    placeholder="Provide comment for tracking audit logs..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  ></textarea>
                  <div className="flex gap-2">
                    <button
                      disabled={isApproving}
                      onClick={() => handleApprove(selectedWorkflow.id)}
                      className="flex-1 py-1.5 bg-emerald-650 hover:bg-emerald-550 disabled:bg-slate-800 text-slate-950 hover:text-slate-950 font-bold text-[10px] uppercase rounded transition-colors cursor-pointer text-center"
                    >
                      Approve
                    </button>
                    <button
                      disabled={isApproving}
                      onClick={() => handleReject(selectedWorkflow.id)}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-bold text-[10px] uppercase rounded transition-colors cursor-pointer text-center"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : selectedWorkflow.status === 'Pending' ? (
                <div className="p-2.5 bg-amber-500/5 rounded border border-amber-500/10 flex gap-2 text-[10px] text-amber-400 leading-normal font-sans">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Awaiting sign-off by: <strong>{selectedWorkflow.currentAssignee}</strong>. You do not possess the manager credentials required to authorize this request. Switch demo privileges below if needed.</span>
                </div>
              ) : null}

            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center text-slate-500 font-mono text-xs py-12">
            SELECT A PROPOSAL RECORD TO VIEW SYSTEM TRACE DETAILS AND DYNAMIC LOGS.
          </div>
        )}

        {/* Real-time Notification Dispatch Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[10px] font-bold border-b border-slate-800 pb-2 mb-3 uppercase">
            <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Operational Dispatch Engine</span>
          </div>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="p-2 rounded bg-slate-950/40 border border-slate-850/40 flex flex-col gap-0.5">
                <p className="text-[10px] text-slate-300 leading-tight font-sans font-medium">{n.text}</p>
                <span className="text-[8px] text-slate-550 font-mono self-end">{n.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 text-[8px] text-slate-650 font-mono text-center">
            Automatic SMTP dispatch simulation active.
          </div>
        </div>

      </div>

      {/* Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-lg p-5 relative shadow-2xl">
            <h3 className="text-sm font-bold font-display text-white mb-3">Launch New Approval Workflow</h3>
            
            <form onSubmit={handleCreateWorkflow} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Procurement of GPU instances for model testing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Workflow Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WorkflowType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="Leave">Leave Request</option>
                    <option value="Purchase">Purchase Order</option>
                    <option value="Expense">Expense Reimbursement</option>
                    <option value="Recruitment">Recruitment Authorization</option>
                    <option value="Document">Document Approval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Urgency priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Conditional Amounts for Purchase/Expense */}
              {(type === 'Purchase' || type === 'Expense') && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Required Funding ($ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter amount, e.g., 2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              {/* Conditional Department for Recruitment */}
              {type === 'Recruitment' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Department Allocation</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Engineering, Sales, HR"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Strategic Description / Rationale</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise details, budgets breakdown, or specific dates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 font-bold text-[10px] uppercase cursor-pointer text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] text-slate-950 uppercase cursor-pointer disabled:bg-slate-800 transition-all"
                >
                  SUBMIT PROPOSAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
