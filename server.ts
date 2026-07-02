import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  WorkflowRequest, 
  KnowledgeArticle, 
  Task, 
  ChatMessage, 
  CalendarEvent, 
  Announcement, 
  AuditLog, 
  User, 
  UserRole 
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log('Gemini API client initialized successfully.');
      } catch (err) {
        console.error('Error initializing Gemini client:', err);
      }
    } else {
      console.warn('GEMINI_API_KEY is not set or has the default placeholder. Gemini API calls will run in Simulation Mode.');
    }
  }
  return aiClient;
}

// Global In-Memory Enterprise Mock Database
let currentRole: UserRole = 'Admin';
let currentUser: User = {
  id: 'EMP-001',
  name: 'Marcus Vance',
  email: 'm.vance@cortexai.enterprise',
  role: 'Admin',
  department: 'Operations',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
};

const userDirectory: User[] = [
  { id: 'EMP-001', name: 'Marcus Vance', email: 'm.vance@cortexai.enterprise', role: 'Admin', department: 'Operations' },
  { id: 'EMP-002', name: 'Sarah Jenkins', email: 's.jenkins@cortexai.enterprise', role: 'Employee', department: 'Human Resources' },
  { id: 'EMP-003', name: 'David Kim', email: 'd.kim@cortexai.enterprise', role: 'Manager', department: 'Engineering' },
  { id: 'EMP-004', name: 'Elena Rostova', email: 'e.rostova@cortexai.enterprise', role: 'Employee', department: 'Finance' },
  { id: 'EMP-005', name: 'Tariq Al-Fayed', email: 't.fayed@cortexai.enterprise', role: 'Manager', department: 'Operations' }
];

let workflows: WorkflowRequest[] = [
  {
    id: 'WF-101',
    title: 'Annual Summer Leave Request',
    type: 'Leave',
    creator: { id: 'EMP-002', name: 'Sarah Jenkins', email: 's.jenkins@cortexai.enterprise', role: 'Employee', department: 'Human Resources' },
    status: 'Pending',
    submissionDate: '2026-06-28',
    priority: 'Medium',
    description: 'Requesting 10 days of paid leave from July 15th to July 29th for a family vacation to Greece.',
    currentAssignee: 'Human Resources Manager',
    logs: [
      { id: 'L-1', timestamp: '2026-06-28T09:15:00Z', user: 'Sarah Jenkins', action: 'Created', comment: 'Submitted with flight itinerary attached.' }
    ]
  },
  {
    id: 'WF-102',
    title: 'Kubernetes Cloud Cluster Upgrade',
    type: 'Purchase',
    creator: { id: 'EMP-003', name: 'David Kim', email: 'd.kim@cortexai.enterprise', role: 'Manager', department: 'Engineering' },
    status: 'Pending',
    submissionDate: '2026-06-30',
    priority: 'High',
    amount: 14850,
    description: 'Procuring high-availability AWS EKS Nodes to support the migration of the core CortexAI model runner backend.',
    currentAssignee: 'Finance Controller',
    logs: [
      { id: 'L-2', timestamp: '2026-06-30T14:22:00Z', user: 'David Kim', action: 'Created', comment: 'Approved by Engineering Director. Pending Finance budget sign-off.' }
    ]
  },
  {
    id: 'WF-103',
    title: 'Senior AI Research Engineer Recruitment',
    type: 'Recruitment',
    creator: { id: 'EMP-001', name: 'Marcus Vance', email: 'm.vance@cortexai.enterprise', role: 'Admin', department: 'Operations' },
    status: 'Approved',
    submissionDate: '2026-06-15',
    priority: 'High',
    department: 'Engineering',
    description: 'Hiring position to lead our autonomous agent framework expansion. Budget allocated and role defined.',
    currentAssignee: 'Talent Acquisition Team',
    logs: [
      { id: 'L-3', timestamp: '2026-06-15T08:00:00Z', user: 'Marcus Vance', action: 'Created' },
      { id: 'L-4', timestamp: '2026-06-16T11:30:00Z', user: 'Tariq Al-Fayed', action: 'Approved', comment: 'Critical hire. Standard HR recruitment pipeline initiated.' }
    ]
  },
  {
    id: 'WF-104',
    title: 'Q2 Travel Expense Reimbursement',
    type: 'Expense',
    creator: { id: 'EMP-004', name: 'Elena Rostova', email: 'e.rostova@cortexai.enterprise', role: 'Employee', department: 'Finance' },
    status: 'Rejected',
    submissionDate: '2026-06-20',
    priority: 'Low',
    amount: 420,
    description: 'Expense reimbursement for lodging and meals during the enterprise audit trip to NY.',
    currentAssignee: 'Finance Department',
    logs: [
      { id: 'L-5', timestamp: '2026-06-20T17:40:00Z', user: 'Elena Rostova', action: 'Created' },
      { id: 'L-6', timestamp: '2026-06-22T10:15:00Z', user: 'Tariq Al-Fayed', action: 'Rejected', comment: 'Receipts for NYC dinner are illegible. Please scan again.' }
    ]
  }
];

let knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'KB-201',
    title: 'Enterprise Remote Work Security Guidelines',
    content: 'All corporate devices must connect via the CortexVPN before accessing central file repositories or AWS Cloud Run instances. Employees are required to enroll in YubiKey or SMS multi-factor authentication (MFA) within 48 hours of onboarding. Sensitive enterprise datasets must never be cached locally on non-corporate hardware. Violations are audited and tracked dynamically by the Security Operations Center (SOC).',
    summary: 'Essential guidelines mandating VPN connection, multi-factor authentication (MFA) enrollment, and strict prohibition of local caching of sensitive data to maintain enterprise security posture.',
    category: 'Security',
    tags: ['VPN', 'MFA', 'Remote', 'Compliance'],
    viewCount: 245,
    helpfulCount: 42,
    author: 'Marcus Vance',
    createdDate: '2026-01-10'
  },
  {
    id: 'KB-202',
    title: 'Spring Security with OAuth2 & Hibernate Integration',
    content: 'When configuring Spring Security with OAuth2 login, ensure that user details are automatically mapped to the database via custom OidcUserService or DefaultOAuth2UserService implementations. Database transactions should use Hibernate\'s @Transactional annotation with appropriate propagation settings to avoid locking resource records. Use Redis caches to temporarily persist JWT claims and session markers, and ensure that custom validation triggers handle input sanitization to thwart SQL Injection.',
    summary: 'Best practices for mapping OAuth2 user details in Spring Security, managing database transaction propagation with Hibernate, and using Redis caches to minimize JWT claim queries.',
    category: 'Engineering',
    tags: ['Spring Boot', 'OAuth2', 'Hibernate', 'Redis'],
    viewCount: 189,
    helpfulCount: 56,
    author: 'David Kim',
    createdDate: '2026-03-22'
  },
  {
    id: 'KB-203',
    title: 'Corporate Travel and Expense Policy (v4.1)',
    content: 'The travel expense allowance lists a daily maximum of $150 for meals, $250 for NYC/SF hotel stays, and $180 for standard municipal regions. Receipts are required for any single transaction exceeding $25. Flight bookings should use the Corporate Portal to secure 15% preferred pricing. Submissions must occur within 30 days of returning. Approvals follow a three-tier model: Manager, Department Head, and Finance Controller.',
    summary: 'Defines limits on corporate travel expenses ($150 meals, $250 NYC hotels), submission deadlines, and approval routing hierarchies.',
    category: 'Finance',
    tags: ['Expense', 'Travel', 'Finance', 'Policy'],
    viewCount: 132,
    helpfulCount: 21,
    author: 'Elena Rostova',
    createdDate: '2026-05-04'
  }
];

let tasks: Task[] = [
  { id: 'TSK-301', title: 'Audit AWS Cloud Config', description: 'Review security group configurations and delete unused ingress rule permissions.', status: 'Todo', priority: 'High', assignee: 'Marcus Vance', dueDate: '2026-07-10' },
  { id: 'TSK-302', title: 'Draft HR Holiday Notice', description: 'Draft and publish the announcement regarding upcoming summer office closures.', status: 'InProgress', priority: 'Low', assignee: 'Sarah Jenkins', dueDate: '2026-07-04' },
  { id: 'TSK-303', title: 'Optimize Redis Cache Queries', description: 'Configure TTL values for JWT access session lookups to reduce cache size.', status: 'Review', priority: 'Medium', assignee: 'David Kim', dueDate: '2026-07-05' },
  { id: 'TSK-304', title: 'Publish Q2 Financial Report', description: 'Compile auditing sheets and publish summaries to executive partners.', status: 'Done', priority: 'High', assignee: 'Elena Rostova', dueDate: '2026-06-30' }
];

let chatMessages: ChatMessage[] = [
  { id: 'MSG-401', sender: 'David Kim', senderRole: 'Manager', message: 'Hi team, has anyone reviewed the new Spring Security deployment configuration?', timestamp: '2026-07-01T10:00:00Z', channel: 'General' },
  { id: 'MSG-402', sender: 'Marcus Vance', senderRole: 'Admin', message: 'Yes David, the security configuration is complete. We need to verify VPN compliance rules are applied.', timestamp: '2026-07-01T10:05:00Z', channel: 'General' },
  { id: 'MSG-403', sender: 'Sarah Jenkins', senderRole: 'Employee', message: 'Friendly reminder to submit all Q2 Expense workflows by Friday!', timestamp: '2026-07-01T11:12:00Z', channel: 'HR' },
  { id: 'MSG-404', sender: 'David Kim', senderRole: 'Manager', message: 'Starting the cluster optimization today. Let me know if there are any database locking issues.', timestamp: '2026-07-01T12:00:00Z', channel: 'Project Alpha' }
];

let calendarEvents: CalendarEvent[] = [
  { id: 'EV-501', title: 'CortexAI Operational Townhall', date: '2026-07-05', type: 'Meeting', description: 'Monthly company-wide meeting discussing operational roadmap and AI goals.', department: 'Operations' },
  { id: 'EV-502', title: 'Q2 Expense Submission Deadline', date: '2026-07-03', type: 'Deadline', description: 'All employees must file travel and purchase reimbursements before close of business.', department: 'Finance' },
  { id: 'EV-503', title: 'Security Audit: Firewall Rules', date: '2026-07-12', type: 'General', description: 'External agency auditing AWS security configurations and compliance logs.', department: 'Operations' }
];

let announcements: Announcement[] = [
  { id: 'AN-601', title: 'HR Announcement: Flexible Summer Hours', content: 'Starting Monday, all employees may utilize flexible summer working arrangements, allowing a 4-day condensed week or adjusted daily hours. Please coordinate with your direct reporting manager.', date: '2026-06-25', category: 'HR', creator: 'Sarah Jenkins' },
  { id: 'AN-602', title: 'Scheduled Maintenance: Redis & database Servers', content: 'On Saturday, July 5th between 01:00 AM and 03:00 AM UTC, the production Redis and indexing database clusters will undergo routine patches. Brief service latency is expected.', date: '2026-06-30', category: 'IT', creator: 'Marcus Vance' }
];

let auditLogs: AuditLog[] = [
  { id: 'AUD-701', timestamp: '2026-07-01T08:00:00Z', user: 'System Init', role: 'Admin', action: 'BOOT', details: 'CortexAI Enterprise OS booted successfully.', ipAddress: '127.0.0.1' },
  { id: 'AUD-702', timestamp: '2026-07-01T10:05:00Z', user: 'Marcus Vance', role: 'Admin', action: 'ROLE_SWITCH', details: 'Switched session view privileges to Admin.', ipAddress: '192.168.1.14' }
];

// Utility helper to write audit logs
function createAuditLog(user: string, role: UserRole, action: string, details: string) {
  const log: AuditLog = {
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user,
    role,
    action,
    details,
    ipAddress: '192.168.1.45'
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 100) auditLogs.pop(); // Keep top 100
}

// ---------------- API ENDPOINTS ----------------

// GET Current Session User / Role configuration
app.get('/api/user', (req, res) => {
  res.json({ currentUser, currentRole, directory: userDirectory });
});

// Switch role (for portal demonstrations)
app.post('/api/user/role', (req, res) => {
  const { role, userId } = req.body;
  const match = userDirectory.find(u => u.id === userId || u.role === role);
  if (match) {
    currentUser = { ...match, avatar: match.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${match.name}` };
    currentRole = match.role;
    createAuditLog(currentUser.name, currentRole, 'ROLE_SWITCH', `Switched current session user to ${currentUser.name} (${currentRole})`);
    res.json({ currentUser, currentRole });
  } else {
    res.status(404).json({ error: 'User/Role not found' });
  }
});

// GET Workflows
app.get('/api/workflows', (req, res) => {
  res.json(workflows);
});

// POST Create Workflow Request
app.post('/api/workflows', (req, res) => {
  const { title, type, priority, amount, department, description } = req.body;
  if (!title || !type || !description) {
    return res.status(400).json({ error: 'Missing required workflow fields.' });
  }

  const newRequest: WorkflowRequest = {
    id: `WF-${Date.now().toString().slice(-3)}`,
    title,
    type,
    creator: { ...currentUser },
    status: 'Pending',
    submissionDate: new Date().toISOString().split('T')[0],
    priority: priority || 'Medium',
    amount: amount ? Number(amount) : undefined,
    department: department || currentUser.department,
    description,
    currentAssignee: type === 'Leave' || type === 'Recruitment' ? 'HR Department' : type === 'Expense' || type === 'Purchase' ? 'Finance Controller' : 'Manager',
    logs: [
      { id: `L-${Date.now()}`, timestamp: new Date().toISOString(), user: currentUser.name, action: 'Created', comment: 'Initiated request via CortexAI Workflow Engine.' }
    ]
  };

  workflows.unshift(newRequest);
  createAuditLog(currentUser.name, currentRole, 'WORKFLOW_CREATE', `Created ${type} Workflow: "${title}"`);
  res.status(201).json(newRequest);
});

// POST Approve Workflow
app.post('/api/workflows/:id/approve', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const wf = workflows.find(w => w.id === id);

  if (!wf) return res.status(404).json({ error: 'Workflow request not found.' });

  wf.status = 'Approved';
  wf.logs.unshift({
    id: `L-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'Approved',
    comment: comment || 'Approved by authority.'
  });

  createAuditLog(currentUser.name, currentRole, 'WORKFLOW_APPROVE', `Approved Workflow ${id}: "${wf.title}"`);
  res.json(wf);
});

// POST Reject Workflow
app.post('/api/workflows/:id/reject', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const wf = workflows.find(w => w.id === id);

  if (!wf) return res.status(404).json({ error: 'Workflow request not found.' });

  wf.status = 'Rejected';
  wf.logs.unshift({
    id: `L-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: currentUser.name,
    action: 'Rejected',
    comment: comment || 'Rejected. Requires revision.'
  });

  createAuditLog(currentUser.name, currentRole, 'WORKFLOW_REJECT', `Rejected Workflow ${id}: "${wf.title}"`);
  res.json(wf);
});

// GET Knowledge Base Articles
app.get('/api/articles', (req, res) => {
  res.json(knowledgeArticles);
});

// POST Create Article (Includes optional AI summary generator)
app.post('/api/articles', async (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Missing required article fields.' });
  }

  let summary = 'Document summary pending AI analysis.';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Provide a concise 1-sentence executive summary of the following document:\n\n${content}`,
        config: {
          systemInstruction: "You are an executive knowledge catalog assistant. Provide exactly one sentence encapsulating the document's key rule or message. Be direct and simple.",
        }
      });
      if (response.text) {
        summary = response.text.trim();
      }
    } catch (e) {
      console.error('Error generating AI summary for article:', e);
      summary = 'Summary generated locally: Document outlining operational structures for ' + category + '.';
    }
  } else {
    summary = `Simulation Summary: This compliance document defines standard operations, parameters, and roles regarding ${category}.`;
  }

  const newArticle: KnowledgeArticle = {
    id: `KB-${Date.now().toString().slice(-3)}`,
    title,
    content,
    summary,
    category,
    tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
    viewCount: 1,
    helpfulCount: 0,
    author: currentUser.name,
    createdDate: new Date().toISOString().split('T')[0]
  };

  knowledgeArticles.unshift(newArticle);
  createAuditLog(currentUser.name, currentRole, 'KNOWLEDGE_CREATE', `Published Article: "${title}" with AI Summarization`);
  res.status(201).json(newArticle);
});

// POST Helpful/View increments
app.post('/api/articles/:id/helpful', (req, res) => {
  const { id } = req.params;
  const art = knowledgeArticles.find(a => a.id === id);
  if (art) {
    art.helpfulCount += 1;
    res.json(art);
  } else {
    res.status(404).json({ error: 'Article not found.' });
  }
});

// GET Kanban Tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// POST Create Kanban Task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority, assignee, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required.' });

  const newTask: Task = {
    id: `TSK-${Date.now().toString().slice(-3)}`,
    title,
    description: description || '',
    status: 'Todo',
    priority: priority || 'Medium',
    assignee: assignee || currentUser.name,
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  tasks.push(newTask);
  createAuditLog(currentUser.name, currentRole, 'TASK_CREATE', `Created task: "${title}" assigned to ${newTask.assignee}`);
  res.status(201).json(newTask);
});

// PUT Update Task Status
app.put('/api/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = tasks.find(t => t.id === id);
  if (task) {
    const oldStatus = task.status;
    task.status = status;
    createAuditLog(currentUser.name, currentRole, 'TASK_UPDATE', `Moved task "${task.title}" from ${oldStatus} to ${status}`);
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found.' });
  }
});

// GET Chats
app.get('/api/chat', (req, res) => {
  const { channel } = req.query;
  if (channel) {
    res.json(chatMessages.filter(m => m.channel === channel));
  } else {
    res.json(chatMessages);
  }
});

// POST Chat message with trigger for Gemini assistant if channel is 'AI Chat'
app.post('/api/chat', async (req, res) => {
  const { message, channel } = req.body;
  if (!message || !channel) return res.status(400).json({ error: 'Message and Channel are required.' });

  const newMsg: ChatMessage = {
    id: `MSG-${Date.now()}`,
    sender: currentUser.name,
    senderRole: currentRole,
    message,
    timestamp: new Date().toISOString(),
    channel
  };

  chatMessages.push(newMsg);

  // If chat is targeting AI Chat channel, trigger automated Gemini analysis
  if (channel === 'AI Chat') {
    const ai = getGeminiClient();
    let aiResponse = '';

    if (ai) {
      try {
        // Construct system instruction regarding database context
        const sysContext = `
          You are CortexAI, an autonomous enterprise operating system assistant.
          Current enterprise metadata context:
          - Active User: ${currentUser.name} (${currentRole}) in Department: ${currentUser.department}.
          - Active Workflows: ${workflows.length} total. Pending: ${workflows.filter(w=>w.status==='Pending').length}.
          - Knowledge Base articles: ${knowledgeArticles.length} documents.
          - Tasks in Pipeline: ${tasks.length} tasks.
          
          Respond briefly, elegantly, and professionally. Support document lookup, workflow recommendations, leave queries, or report requests. Always formulate replies inside standard enterprise communication standards.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: sysContext,
          }
        });
        aiResponse = response.text || 'Apologies, my inference pipeline did not return text.';
      } catch (err) {
        console.error('Error in AI Chat response:', err);
        aiResponse = `[System Status: Model Latency Timeout] Thank you for your inquiry: "${message}". Currently simulating feedback due to model latency bounds. Active workflows are monitored in Operations.`;
      }
    } else {
      // High-quality deterministic simulation responses
      const text = message.toLowerCase();
      if (text.includes('workflow') || text.includes('leave') || text.includes('approve')) {
        aiResponse = `Hello ${currentUser.name}. I analyzed our current workflow matrix. We have ${workflows.filter(w=>w.status==='Pending').length} pending requests. Sarah Jenkins' Leave request (WF-101) requires immediate Manager review, while David Kim's Purchase order (WF-102) of $14,850 requires Finance audit approvals.`;
      } else if (text.includes('task') || text.includes('todo') || text.includes('assign')) {
        aiResponse = `I found ${tasks.filter(t=>t.status!=='Done').length} active tasks in your workspace. Your highest priority item is "${tasks.find(t=>t.priority==='High')?.title || 'Audit AWS Cloud Config'}" due soon.`;
      } else if (text.includes('security') || text.includes('vpn') || text.includes('mfa')) {
        aiResponse = `Accessing Security Knowledge repository... KB-201 ("Enterprise Remote Work Security Guidelines") states that all connections must route through CortexVPN and mandate SMS or YubiKey enrollment within 48 hours of onboarding.`;
      } else {
        aiResponse = `Welcome to CortexAI Enterprise Assistance. I can assist you with semantic search across our ${knowledgeArticles.length} compliance guidelines, audit pending workflows, generate reports, or allocate task queues. How may I support you?`;
      }
    }

    const aiMsg: ChatMessage = {
      id: `MSG-AI-${Date.now()}`,
      sender: 'CortexAI Agent',
      senderRole: 'Admin',
      message: aiResponse,
      timestamp: new Date().toISOString(),
      channel,
      isAi: true
    };
    chatMessages.push(aiMsg);
  }

  res.status(201).json(newMsg);
});

// GET Calendar Events
app.get('/api/calendar', (req, res) => {
  res.json(calendarEvents);
});

// POST Create Calendar Event
app.post('/api/calendar', (req, res) => {
  const { title, date, type, description, department } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Title and Date are required.' });

  const newEvent: CalendarEvent = {
    id: `EV-${Date.now().toString().slice(-3)}`,
    title,
    date,
    type: type || 'General',
    description: description || '',
    department: department || currentUser.department
  };

  calendarEvents.push(newEvent);
  createAuditLog(currentUser.name, currentRole, 'CALENDAR_CREATE', `Scheduled Event: "${title}" on ${date}`);
  res.status(201).json(newEvent);
});

// GET Announcements
app.get('/api/announcements', (req, res) => {
  res.json(announcements);
});

// POST Create Announcement
app.post('/api/announcements', (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and Content are required.' });

  const newAnn: Announcement = {
    id: `AN-${Date.now()}`,
    title,
    content,
    date: new Date().toISOString().split('T')[0],
    category: category || 'General',
    creator: currentUser.name
  };

  announcements.unshift(newAnn);
  createAuditLog(currentUser.name, currentRole, 'ANNOUNCEMENT_CREATE', `Broadcast Announcement: "${title}"`);
  res.status(201).json(newAnn);
});

// GET Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
});

// GET Dynamic Enterprise Analytics
app.get('/api/analytics', (req, res) => {
  const totalWf = workflows.length;
  const pendingWf = workflows.filter(w => w.status === 'Pending').length;
  const approvedWf = workflows.filter(w => w.status === 'Approved').length;
  
  const totalTsk = tasks.length;
  const completedTsk = tasks.filter(t => t.status === 'Done').length;

  res.json({
    metrics: {
      totalTasks: totalTsk,
      completedTasks: completedTsk,
      activeWorkflows: pendingWf,
      approvedWorkflows: approvedWf,
      knowledgeBaseArticles: knowledgeArticles.length,
      systemHealth: '99.8% Online',
      efficiencyScore: Math.round(((completedTsk + approvedWf) / (totalTsk + totalWf || 1)) * 100)
    },
    workflowDistribution: [
      { name: 'Leave', count: workflows.filter(w => w.type === 'Leave').length },
      { name: 'Purchase', count: workflows.filter(w => w.type === 'Purchase').length },
      { name: 'Expense', count: workflows.filter(w => w.type === 'Expense').length },
      { name: 'Recruitment', count: workflows.filter(w => w.type === 'Recruitment').length },
      { name: 'Document', count: workflows.filter(w => w.type === 'Document').length }
    ],
    taskPriority: [
      { name: 'High', value: tasks.filter(t => t.priority === 'High').length },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length },
      { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length }
    ],
    auditActionTrends: [
      { date: '06/27', activity: 12 },
      { date: '06/28', activity: 18 },
      { date: '06/29', activity: 15 },
      { date: '06/30', activity: 28 },
      { date: '07/01', activity: auditLogs.length }
    ]
  });
});

// POST Dedicated CortexAI Generator Endpoint (Reports, Emails, Meeting notes)
app.post('/api/ai/generate', async (req, res) => {
  const { action, text, documentType, subject, participants, date, duration } = req.body;
  const ai = getGeminiClient();

  if (!action) return res.status(400).json({ error: 'Action parameter is required.' });

  let prompt = '';
  let systemMessage = 'You are CortexAI, an autonomous enterprise intelligence engine.';

  if (action === 'summarize') {
    prompt = `Summarize the following enterprise document beautifully. Format with section headers, brief bullet points, and key takeaways:\n\n${text}`;
    systemMessage = 'You are a corporate documents analyst. Provide well-structured summaries utilizing concise headings and elegant layouts.';
  } else if (action === 'report') {
    prompt = `Generate a high-quality ${documentType || 'Quarterly Progress'} report based on this metadata/context: "${text}". Organize into sections: Executive Summary, Key Performance Indexes, Achievements, and Strategic Recommendations. Include fictitious but realistic, robust statistics.`;
    systemMessage = 'You are a Senior Strategic Analytics Officer. Draft comprehensive enterprise progress reports.';
  } else if (action === 'email') {
    prompt = `Draft an elegant corporate email concerning the subject: "${subject || 'Operational Alignment'}". Context provided: "${text}". Maintain a highly professional and encouraging tone. Include spaces for greeting details, formal subject line, and signature block.`;
    systemMessage = 'You are a principal corporate communications expert. Draft flawless, persuasive executive email communications.';
  } else if (action === 'meeting') {
    prompt = `Compile structured meeting minutes. Participants: "${participants || 'All-Hands Team'}", Date: "${date || 'Today'}", Duration: "${duration || '1 Hour'}". Transcript or discussion topics: "${text}". Generate: Summary, Key Decisions Made, and Action Items (assigned to realistic corporate roles).`;
    systemMessage = 'You are an executive operational coordinator. Generate highly organized meeting summaries and follow-up rosters.';
  } else if (action === 'recommend_workflow') {
    prompt = `Analyze the organizational problem or query: "${text}". Recommend which CortexAI Workflow (Leave, Purchase, Expense, Recruitment, Document Approval) is appropriate, specify the workflow priority, propose realistic budget thresholds, and draft step-by-step routing instructions for the submitter.`;
    systemMessage = 'You are an autonomous operations engineer. Recommend workflow structures and compliance routing rules.';
  } else {
    return res.status(400).json({ error: 'Unknown generation action.' });
  }

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemMessage,
        }
      });
      res.json({ output: response.text || 'No text output.' });
    } catch (err) {
      console.error('Error generating content from Gemini API:', err);
      res.status(500).json({ error: 'Gemini Inference Error. Please try again or check settings.', details: String(err) });
    }
  } else {
    // Elegant fallback simulation content for each action type
    let simResult = '';
    if (action === 'summarize') {
      simResult = `### Document Executive Summary
* **Operational Scope**: Remote Work Compliance Protocol.
* **Key Guidelines**: Mandatory CortexVPN activation; YubiKey SMS multifactor registry inside 48 hours.
* **Core Rule**: Prohibition of physical or storage caching of enterprise files on private endpoints.
* **Takeaway**: Security Compliance Operations (SOC) track all access channels dynamically.`;
    } else if (action === 'report') {
      simResult = `### ${documentType || 'Executive'} Performance Report
**1. Executive Summary**
CortexAI operations completed the quarter with 94.2% efficiency metrics, bolstered by automatic leave and expense routing algorithms.

**2. Key Performance Indexes (KPIs)**
* **Workflows Executed**: 142 Requests
* **AI Assistance Queries**: 4,210 sessions
* **Task Closure Velocity**: +18% over Q1 baseline
* **Database Query Latency**: <12ms average

**3. Achievements**
* Scaled remote worker MFA compliance to 100%.
* Resolved 4 critical server configurations automatically via AI agent routing recommendations.

**4. Strategic Recommendations**
* Optimize Redis cache clusters to persist JWT metrics.
* Broaden automated procurement thresholds from $10k to $15k to streamline engineering supply routes.`;
    } else if (action === 'email') {
      simResult = `Subject: Operational Realignment & Automated Workflow Procedures

Dear Team,

I am writing to outline our upgraded operational standards using the newly integrated CortexAI Operating System. To guarantee organizational agility, we are transitioning all approval pipelines to the CortexAI Unified Workflow Engine.

Please ensure that:
1. All travel reimbursements exceedances ($150+ meal cap / NYC $250 cap) are filed via the Leave or Expense portal within 30 days.
2. The Talent Acquisition pipeline uses the Recruitment portal directly to trigger automated HR budget verification steps.

Thank you for your dedication to operational excellence. Please reach out with any system alignment questions.

Warm regards,

Marcus Vance
Operations Administrator, CortexAI`;
    } else if (action === 'meeting') {
      simResult = `### CortexAI Operational Alignment - Meeting Minutes
**Date**: ${date || '2026-07-01'} | **Duration**: ${duration || '45 Mins'}
**Participants**: ${participants || 'Marcus Vance, David Kim, Elena Rostova'}

#### Discussion Summary
Reviewed cluster latency constraints, JWT security layers on Spring Boot endpoints, and remote onboarding protocols.

#### Key Decisions Made
* Approved immediate Kubernetes Cloud EKS procurement ($14,850 AWS budget) under WF-102.
* Scheduled weekend Redis maintenance window.

#### Action Items
1. **David Kim** — Deploy JWT TTL configurations onto Redis Cache. (Due: July 5th)
2. **Elena Rostova** — Re-verify纽约 expense receipts under WF-104. (Due: July 3rd)
3. **Marcus Vance** — Monitor SOC cloud credentials compliance. (Due: Ongoing)`;
    } else if (action === 'recommend_workflow') {
      simResult = `### CortexAI Operational Diagnosis
**Organizational Challenge**: "${text}"

#### Recommendation: Use Purchase Workflow
* **Suggested Action Priority**: High Priority
* **Proposed Routing Structure**:
  1. **Creator** (Submit request with formal specifications & quote sheets attached)
  2. **Manager Gatekeeper** (David Kim to audit engineering alignment)
  3. **Finance Gatekeeper** (Elena Rostova to crosscheck Q2 EKS budgets)
  4. **Executive Sign-off** (Marcus Vance to authorize procurement WF-102)
  
* **Compliance Insight**: All purchases exceeding $10,000 necessitate secondary executive sign-off. Ensure budget sheets are pre-cleared.`;
    }
    res.json({ output: simResult, isSimulated: true });
  }
});


// ---------------- INITIALIZE DEV OR PROD SERVER ----------------

async function startServer() {
  // Vite dev server integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CortexAI backend engine running on http://0.0.0.0:${PORT}`);
    console.log(`To simulate AI responses locally, provide GEMINI_API_KEY in secrets.`);
  });
}

startServer();
