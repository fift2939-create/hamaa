
export enum TaskStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  OVERDUE = 'OVERDUE',
  PENDING = 'PENDING'
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  managerId: string;
}

export interface Department {
  id: string;
  name: string;
  projectId: string; // القسم ينتمي لمشروع محدد
  color?: string; // اللون التعريفي للقسم
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  projectId?: string;
  role: 'Admin' | 'DeptHead' | 'Employee';
  hireDate: string;
  address?: string;
}

export interface Task {
  id: string;
  projectId: string;
  departmentId: string;
  employeeId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  deadline: string;
  budget?: number; // تكلفة المهمة إن وجدت
}

export interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  name: string;
  role: 'Admin' | 'DeptHead' | 'Employee';
  departmentId?: string;
  projectId?: string;
}

export interface ChatMessage {
  id: string;
  fromId: string;
  toId: string; // يمكن أن يكون ID موظف أو ID مشروع (للدردشة العامة)
  content: string;
  timestamp: string;
  type: 'private' | 'project';
  projectId: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'status' | 'deadline' | 'system';
  timestamp: string;
  read: boolean;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
}

// Added Stats interface to fix import error in Dashboard.tsx
export interface Stats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
}

// Added Beneficiary interface to fix import error in OfficeServices.tsx
export interface Beneficiary {
  id: string;
  name: string;
  phone: string;
  category?: string;
}

// Added OfficeMessage interface to fix import error in OfficeServices.tsx
export interface OfficeMessage {
  id: string;
  beneficiaryId: string;
  departmentId: string;
  messageType: string;
  content: string;
  sentAt: string;
  isDelivered: boolean;
  hasReplied: boolean;
  replyContent?: string;
  repliedAt?: string;
}
