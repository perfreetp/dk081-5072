import { create } from 'zustand';
import type { Worker, WorkerStatus, WorkerType, Team, SkillTag } from '@/types/worker';
import mockWorkers, { TEAMS } from '@/data/mockWorkers';

interface WorkerFilters {
  type?: WorkerType;
  status?: WorkerStatus;
  teamId?: string;
  skillId?: string;
  keyword?: string;
}

interface WorkerState {
  workers: Worker[];
  teams: Team[];
  selectedIds: string[];
  filters: WorkerFilters;
  activeTab: WorkerStatus | 'ALL';
  isLoading: boolean;

  setActiveTab: (tab: WorkerStatus | 'ALL') => void;
  setFilters: (filters: Partial<WorkerFilters>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (id: string, data: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  updateWorkerStatus: (id: string, status: WorkerStatus) => void;
  assignTeam: (id: string, teamId: string, teamName: string) => void;
  addSkill: (id: string, skill: SkillTag) => void;
  removeSkill: (id: string, skillId: string) => void;
  getWorkerById: (id: string) => Worker | undefined;
  getTeamById: (id: string) => Team | undefined;
  getFilteredWorkers: () => Worker[];
  getAvailableWorkers: (requiredSkillIds?: string[]) => Worker[];
  getStats: () => { total: number; onDuty: number; onTask: number; offDuty: number; onLeave: number; internal: number; outsource: number };
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  workers: mockWorkers,
  teams: TEAMS,
  selectedIds: [],
  filters: {},
  activeTab: 'ALL',
  isLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (newFilters) => set((s) => ({ filters: { ...s.filters, ...newFilters } })),
  resetFilters: () => set({ filters: {} }),
  toggleSelect: (id) => set((s) => ({
    selectedIds: s.selectedIds.includes(id)
      ? s.selectedIds.filter((x) => x !== id)
      : [...s.selectedIds, id],
  })),
  toggleSelectAll: (ids) => set((s) => {
    const allSelected = ids.every((id) => s.selectedIds.includes(id));
    return { selectedIds: allSelected ? s.selectedIds.filter((id) => !ids.includes(id)) : [...new Set([...s.selectedIds, ...ids])] };
  }),
  clearSelection: () => set({ selectedIds: [] }),
  addWorker: (worker) => set((s) => ({
    workers: [...s.workers, { ...worker, id: `WRK${String(s.workers.length + 1).padStart(3, '0')}` }],
  })),
  updateWorker: (id, data) => set((s) => ({
    workers: s.workers.map((w) => w.id === id ? { ...w, ...data } : w),
  })),
  deleteWorker: (id) => set((s) => ({
    workers: s.workers.filter((w) => w.id !== id),
  })),
  updateWorkerStatus: (id, status) => set((s) => ({
    workers: s.workers.map((w) => w.id === id ? { ...w, status } : w),
  })),
  assignTeam: (id, teamId, teamName) => set((s) => ({
    workers: s.workers.map((w) => w.id === id ? { ...w, teamId, teamName } : w),
  })),
  addSkill: (id, skill) => set((s) => ({
    workers: s.workers.map((w) => w.id === id && !w.skills.some((sk) => sk.id === skill.id)
      ? { ...w, skills: [...w.skills, skill] }
      : w),
  })),
  removeSkill: (id, skillId) => set((s) => ({
    workers: s.workers.map((w) => w.id === id ? { ...w, skills: w.skills.filter((sk) => sk.id !== skillId) } : w),
  })),
  getWorkerById: (id) => get().workers.find((w) => w.id === id),
  getTeamById: (id) => get().teams.find((t) => t.id === id),
  getFilteredWorkers: () => {
    const { workers, filters, activeTab } = get();
    return workers.filter((w) => {
      if (activeTab !== 'ALL' && w.status !== activeTab) return false;
      if (filters.type && w.type !== filters.type) return false;
      if (filters.status && w.status !== filters.status) return false;
      if (filters.teamId && w.teamId !== filters.teamId) return false;
      if (filters.skillId && !w.skills.some((sk) => sk.id === filters.skillId)) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        return w.name.includes(kw) || w.phone.includes(kw);
      }
      return true;
    });
  },
  getAvailableWorkers: (requiredSkillIds) => {
    const { workers } = get();
    return workers.filter((w) => {
      if (w.status !== 'ON_DUTY') return false;
      if (requiredSkillIds && requiredSkillIds.length > 0) {
        return requiredSkillIds.every((sid) => w.skills.some((sk) => sk.id === sid));
      }
      return true;
    });
  },
  getStats: () => {
    const { workers } = get();
    return {
      total: workers.length,
      onDuty: workers.filter((w) => w.status === 'ON_DUTY').length,
      onTask: workers.filter((w) => w.status === 'ON_TASK').length,
      offDuty: workers.filter((w) => w.status === 'OFF_DUTY').length,
      onLeave: workers.filter((w) => w.status === 'ON_LEAVE').length,
      internal: workers.filter((w) => w.type === 'INTERNAL').length,
      outsource: workers.filter((w) => w.type === 'OUTSOURCE').length,
    };
  },
}));
