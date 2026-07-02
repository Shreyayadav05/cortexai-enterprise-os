export type UserRole = 'Employee' | 'Manager' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type WorkflowType = 'Leave' | 'Purchase' | 'Expense' | 'Recruitment' | 'Document';
export type WorkflowStatus = 'Pending' | 'Approved' | 'Rejected';

export interface WorkflowLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  comment?: string;
}

export interface WorkflowRequest {
  id: string;
  title: string;
  type: WorkflowType;
  creator: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
  };
  status: WorkflowStatus;
  submissionDate: string;
  priority: 'Low' | 'Medium' | 'High';
  amount?: number; // Used for Expense & Purchase
  department?: string; // Used for Recruitment / general
  description: string;
  currentAssignee: string; // E.g., 'HR Department', 'Manager', 'Finance Team'
  logs: WorkflowLog[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  author: string;
  createdDate: string;
}

export type TaskStatus = 'Todo' | 'InProgress' | 'Review' | 'Done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  dueDate: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  channel: string;
  isAi?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Meeting' | 'Deadline' | 'General';
  description: string;
  department?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'General' | 'HR' | 'IT' | 'Finance';
  creator: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  activeWorkflows: number;
  approvedWorkflows: number;
  knowledgeBaseArticles: number;
  systemHealth: string;
  efficiencyScore: number;
}
