export type WorkerType = 'INTERNAL' | 'OUTSOURCE';
export type WorkerStatus = 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE' | 'ON_TASK';

export interface SkillTag {
  id: string;
  name: string;
  color: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  avatar?: string;
  type: WorkerType;
  teamId?: string;
  teamName?: string;
  joinDate: string;
  skills: SkillTag[];
  status: WorkerStatus;
  location?: string;
  todayTaskCount: number;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    complaintCount: number;
    complaintRate: number;
    onTimeRate: number;
    avgTaskMinutes: number;
    monthTasks: number;
  };
  bankAccount?: string;
  idCardFront?: string;
  idCardBack?: string;
  driverLicense?: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  contact: string;
  type: WorkerType;
}
