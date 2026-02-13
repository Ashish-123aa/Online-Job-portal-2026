import { create } from 'zustand';
import type { Job, Application } from '@shared/types';
interface JobState {
  jobs: Job[];
  myApplications: Application[];
  setJobs: (jobs: Job[]) => void;
  setMyApplications: (applications: Application[]) => void;
  addApplication: (application: Application) => void;
}
export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  myApplications: [],
  setJobs: (jobs) => set({ jobs }),
  setMyApplications: (applications) => set({ myApplications: applications }),
  addApplication: (application) =>
    set((state) => ({
      myApplications: [...state.myApplications, application],
    })),
}));