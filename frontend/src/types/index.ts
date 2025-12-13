export interface User {
  _id: string;
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'passenger' | 'officer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  vehicleNumber?: string;
  route?: string;
  dateTime: string;
  incidentTime?: string;
  location?: string;
  attachments?: string[];
  submittedBy: string | { _id: string; firstName?: string; lastName?: string; email: string };
  assignedTo?: string | { _id: string; firstName?: string; lastName?: string; email: string };
  resolution?: string;
  resolutionNotes?: string;
  resolutionDate?: string;
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  aiAnalysis?: {
    priority: string;
    sentiment: number;
    category: string;
    confidence: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  activeOfficers?: number;
  totals?: {
    registeredOfficers?: number;
  };

  percentages?: {
    pending?: number;
    resolved?: number;
    highPriority?: number;
    mediumPriority?: number;
    lowPriority?: number;
  };
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ComplaintFormData = Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'submittedBy' | 'aiAnalysis'>;