export interface User {
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
  location?: string;
  attachments?: string[];
  submittedBy: string;
  assignedTo?: string;
  resolution?: string;
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