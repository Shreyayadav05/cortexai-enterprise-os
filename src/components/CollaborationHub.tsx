import { useState, useEffect, FormEvent } from 'react';
import { 
  MessageSquare, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Megaphone, 
  Send, 
  PlusCircle, 
  Clock, 
  User as UserIcon, 
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';
import { User, UserRole, Task, ChatMessage, CalendarEvent, Announcement } from '../types';

interface CollaborationHubProps {
  currentUser: User;
  currentRole: UserRole;
  tasks: Task[];
  chatMessages: ChatMessage[];
  calendarEvents: CalendarEvent[];
  announcements: Announcement[];
  onRefreshTasks: () => void;
  onRefreshChat: () => void;
  onRefreshCalendar: () => void;
  onRefreshAnnouncements: () => void;
}

type SubTab = 'tasks' | 'chat' | 'calendar' | 'announcements';

export default function CollaborationHub({
  currentUser,
  currentRole,
  tasks,
  chatMessages,
  calendarEvents,
  announcements,
  onRefreshTasks,
  onRefreshChat,
  onRefreshCalendar,
  onRefreshAnnouncements
}: CollaborationHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('tasks');
  
  // Tasks Kanban States
  const [isTaskOpen, setIsTaskOpen] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskAssignee, setTaskAssignee] = useState<string>('');

  // Chat States
  const [selectedChannel, setSelectedChannel] = useState<string>('General');
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Calendar States
  const [isCalOpen, setIsCalOpen] = useState<boolean>(false);
  const [calTitle, setCalTitle] = useState<string>('');
  const [calDate, setCalDate] = useState<string>('');
  const [calType, setCalType] = useState<'Meeting' | 'Deadline' | 'General'>('Meeting');
  const [calDesc, setCalDesc] = useState<string>('');

  // Announcement States
  const [isAnnOpen, setIsAnnOpen] = useState<boolean>(false);
  const [annTitle, setAnnTitle] = useState<string>('');
  const [annContent, setAnnContent] = useState<string>('');
  const [annCategory, setAnnCategory] = useState<'General' | 'HR' | 'IT' | 'Finance'>('General');

  const channels = ['General', 'HR', 'IT Support', 'Project Alpha', 'AI Chat'];

  // Handle task status transitions
  async function handleMoveTask(taskId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onRefreshTasks();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle new Task creation
  async function handleCreateTask(e: FormEvent) {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          assignee: taskAssignee
        })
      });
      if (res.ok) {
        onRefreshTasks();
        setTaskTitle('');
        setTaskDesc('');
        setTaskAssignee('');
        setIsTaskOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Sending Chat Messages (and AI triggering)
  async function handleSendChat(e: FormEvent) {
    e.preventDefault();
    if (!chatInput) return;
    setIsSendingChat(true);
    const msg = chatInput;
    setChatInput('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          channel: selectedChannel
        })
      });
      if (res.ok) {
        onRefreshChat();
        // If chat is targeting the AI Chat, wait briefly to trigger local reload
        if (selectedChannel === 'AI Chat') {
          setTimeout(() => {
            onRefreshChat();
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  }

  // Handle new Calendar Event scheduling
  async function handleCreateCalendar(e: FormEvent) {
    e.preventDefault();
    if (!calTitle || !calDate) return;
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: calTitle,
          date: calDate,
          type: calType,
          description: calDesc
        })
      });
      if (res.ok) {
        onRefreshCalendar();
        setCalTitle('');
        setCalDate('');
        setCalDesc('');
        setIsCalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle new Announcement broadcasting
  async function handleCreateAnnouncement(e: FormEvent) {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          category: annCategory
        })
      });
      if (res.ok) {
        onRefreshAnnouncements();
        setAnnTitle('');
        setAnnContent('');
        setIsAnnOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const getPriorityColor = (p: string) => {
    if (p === 'High') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-hidden flex text-slate-200">
      
      {/* Secondary Hub sub-navigation */}
      <div className="w-52 bg-slate-900 border-r border-slate-800 flex flex-col p-3 shrink-0">
        <h3 className="text-[9px] font-bold tracking-wider text-slate-500 uppercase font-mono mb-3 px-2">COLLABORATION HUB</h3>
        
        <div className="space-y-1">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'tasks' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Kanban Tasks
          </button>
          
          <button
            onClick={() => { setActiveSubTab('chat'); onRefreshChat(); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'chat' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Channels Chat
          </button>

          <button
            onClick={() => { setActiveSubTab('calendar'); onRefreshCalendar(); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'calendar' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4" /> Event Scheduler
          </button>

          <button
            onClick={() => { setActiveSubTab('announcements'); onRefreshAnnouncements(); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'announcements' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Announcements
          </button>
        </div>

        <div className="mt-auto p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-[9px] text-slate-500 leading-normal font-mono">
          <p className="font-bold text-slate-400 mb-0.5">CORTEX BRIDGE</p>
          Simulates real-time corporate synchronicity.
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 bg-slate-950">
        
        {/* TAB 1: KANBAN TASKS */}
        {activeSubTab === 'tasks' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Project Scrum Board</h2>
                <p className="text-xs text-slate-500">Drag or move items through development, review, and deployment pipelines.</p>
              </div>
              <button
                onClick={() => setIsTaskOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-[10px] text-slate-950 uppercase cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Allocate Task
              </button>
            </div>

            {/* Columns Container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-start">
              {(['Todo', 'InProgress', 'Review', 'Done'] as const).map(colStatus => (
                <div key={colStatus} className="bg-slate-900 border border-slate-800 rounded p-3 min-h-[400px] flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 font-mono text-xs">
                    <span className="font-bold text-slate-300 uppercase">{colStatus}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 font-bold text-[10px]">
                      {tasks.filter(t => t.status === colStatus).length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {tasks.filter(t => t.status === colStatus).map(task => (
                      <div key={task.id} className="p-3 bg-slate-950 border border-slate-850 rounded hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all group">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">{task.id}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 leading-normal transition-colors">{task.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                        
                        <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1 text-slate-500 font-mono"><UserIcon className="w-3 h-3 text-slate-600" /> {task.assignee.split(' ')[0]}</span>
                          <span className="text-slate-500 font-mono">{task.dueDate}</span>
                        </div>

                        {/* Move state triggers */}
                        <div className="mt-2 flex justify-end gap-1 border-t border-slate-900/60 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {colStatus !== 'Todo' && (
                            <button 
                              onClick={() => handleMoveTask(task.id, colStatus === 'InProgress' ? 'Todo' : colStatus === 'Review' ? 'InProgress' : 'Review')}
                              className="px-1.5 py-0.5 bg-slate-850 rounded hover:bg-slate-800 text-[9px] cursor-pointer text-slate-450 font-bold uppercase"
                            >
                              ← Prev
                            </button>
                          )}
                          {colStatus !== 'Done' && (
                            <button 
                              onClick={() => handleMoveTask(task.id, colStatus === 'Todo' ? 'InProgress' : colStatus === 'InProgress' ? 'Review' : 'Done')}
                              className="px-1.5 py-0.5 bg-emerald-650/15 text-emerald-400 rounded hover:bg-emerald-650/25 text-[9px] cursor-pointer font-bold uppercase"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CHANNELS CHAT */}
        {activeSubTab === 'chat' && (
          <div className="flex flex-col h-[500px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            
            {/* Chat Room header */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-mono">#</span> {selectedChannel}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {selectedChannel === 'AI Chat' ? 'Direct pipeline into CortexAI Intelligence Model' : 'Simulated company stream'}
                </p>
              </div>

              <div className="flex gap-1.5 font-mono text-[9px]">
                {channels.map(ch => (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors uppercase font-bold ${
                      selectedChannel === ch ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-900 hover:bg-slate-850 text-slate-450'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-950/40 font-sans text-xs">
              {chatMessages.filter(m => m.channel === selectedChannel).map(msg => (
                <div key={msg.id} className={`flex gap-3 max-w-xl ${msg.isAi ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center font-bold text-slate-350 uppercase shrink-0 text-[10px]">
                    {msg.sender.slice(0, 2)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{msg.sender}</span>
                      <span className="text-[8px] font-mono px-1 bg-slate-900 border border-slate-800 rounded text-slate-500 uppercase tracking-wider">{msg.senderRole}</span>
                      <span className="text-[9px] font-mono text-slate-650">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className={`p-2.5 rounded leading-relaxed whitespace-pre-line text-slate-300 ${
                      msg.isAi 
                        ? 'bg-emerald-950/20 border border-emerald-500/20 italic text-emerald-300' 
                        : 'bg-slate-900 border border-slate-850'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}

              {chatMessages.filter(m => m.channel === selectedChannel).length === 0 && (
                <div className="py-24 text-center font-mono text-slate-650 text-xs uppercase tracking-wider">
                  NO CHAT STREAM DATA FOR THIS CHANNEL. INITIATE DISCUSSION BELOW.
                </div>
              )}
            </div>

            {/* Chat input form */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-1.5">
              <input
                type="text"
                required
                placeholder={selectedChannel === 'AI Chat' ? 'Query CortexAI... (e.g., "Analyze our current workflow bottlenecks")' : `Message #${selectedChannel}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-bold text-[10px] uppercase rounded cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Send className="w-3 h-3" /> Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SCHEDULER */}
        {activeSubTab === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Operational Calendar</h2>
                <p className="text-xs text-slate-500">Schedule townhalls, track financial deadlines, and coordinate audits.</p>
              </div>
              <button
                onClick={() => setIsCalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-[10px] text-slate-950 uppercase cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Schedule Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Event Cards */}
              <div className="md:col-span-2 space-y-2.5">
                {calendarEvents.map(ev => (
                  <div key={ev.id} className="p-3 bg-slate-900 border border-slate-800 rounded flex items-start gap-3.5 hover:border-emerald-500/25 transition-colors">
                    <div className="p-2 bg-slate-950 rounded border border-slate-850 text-center w-12 shrink-0 font-mono">
                      <span className="block text-xs text-emerald-400 font-bold">{ev.date.split('-')[2]}</span>
                      <span className="block text-[8px] text-slate-500 uppercase font-black">{new Date(ev.date).toLocaleDateString([], {month: 'short'})}</span>
                    </div>

                    <div className="min-w-0 flex-1 text-xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase ${
                          ev.type === 'Meeting' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          ev.type === 'Deadline' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {ev.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{ev.id}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200">{ev.title}</h4>
                      <p className="text-slate-400 leading-relaxed mt-0.5 text-[11px]">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar Guide */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-3.5 text-xs leading-normal">
                <h4 className="font-bold text-slate-200 font-mono text-[9px] tracking-wider uppercase border-b border-slate-800 pb-1.5">Calendar Audit Regulations</h4>
                <p className="text-slate-400 text-[11px]">
                  Deadlines registered in scheduler trigger automatic SMTP alerts to relevant department operators 24 hours prior. Meetings auto-link to corresponding chat rooms.
                </p>
                <div className="p-2 rounded bg-slate-950/65 border border-slate-850/80 text-[10px] text-slate-500 font-mono">
                  Current Zone: 2026-07-01
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ANNOUNCEMENTS */}
        {activeSubTab === 'announcements' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Enterprise Broadcaster</h2>
                <p className="text-xs text-slate-500">Official general policy announcements, server patch dispatches, and departmental news.</p>
              </div>
              <button
                onClick={() => setIsAnnOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-[10px] text-slate-950 uppercase cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Broadcast Notice
              </button>
            </div>

            <div className="space-y-3.5">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 bg-slate-900 border border-slate-800 rounded relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/1 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/2 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 text-[8px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                        {ann.category} NOTICE
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{ann.date}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">By: {ann.creator}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug">{ann.title}</h3>
                  <p className="text-xs text-slate-350 mt-1.5 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded border border-slate-850/80">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: CREATE TASK */}
      {isTaskOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md p-5 relative shadow-2xl text-xs">
            <h3 className="text-sm font-bold font-display text-white mb-3">Allocate Task to Pipeline</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Configure Redis TTL parameters"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details of the job..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Assignee</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., David Kim"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsTaskOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 font-bold text-[10px] uppercase cursor-pointer text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] uppercase text-slate-950 cursor-pointer"
                >
                  Deploy Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE EVENT */}
      {isCalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md p-5 relative shadow-2xl">
            <h3 className="text-sm font-bold font-display text-white mb-3">Schedule Calendar Event</h3>
            <form onSubmit={handleCreateCalendar} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Q3 Systems Auditing"
                  value={calTitle}
                  onChange={(e) => setCalTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Target Date</label>
                  <input
                    type="date"
                    required
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Event Type</label>
                  <select
                    value={calType}
                    onChange={(e) => setCalType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Deadline">Deadline</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Event Rationale</label>
                <textarea
                  rows={3}
                  placeholder="Outline topics of discussion..."
                  value={calDesc}
                  onChange={(e) => setCalDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                ></textarea>
              </div>
              <div className="flex gap-2 pt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 font-bold text-[10px] uppercase cursor-pointer text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] uppercase text-slate-950 cursor-pointer"
                >
                  Deploy Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NOTICE ANNOUNCEMENT */}
      {isAnnOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md p-5 relative shadow-2xl">
            <h3 className="text-sm font-bold font-display text-white mb-3">Compose Corporate Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Mandatory Security patches on July 5th"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Notice Department Domain</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="General">General</option>
                  <option value="HR">Human Resources</option>
                  <option value="IT">IT Support</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Announcement Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Draft policy announcement details..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                ></textarea>
              </div>
              <div className="flex gap-2 pt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAnnOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 font-bold text-[10px] uppercase cursor-pointer text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] uppercase text-slate-950 cursor-pointer"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
