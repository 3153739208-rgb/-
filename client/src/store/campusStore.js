import { create } from 'zustand';
import { DEFAULT_CAMPUS } from '../utils/constants';

const RECENT_KEY = 'recent_campuses';

const getRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [DEFAULT_CAMPUS];
  } catch {
    return [DEFAULT_CAMPUS];
  }
};

const useCampusStore = create((set) => ({
  currentCampus: getRecent()[0] || DEFAULT_CAMPUS,
  recentCampuses: getRecent(),

  switchCampus: (campus) => {
    set((state) => {
      const recent = [campus, ...state.recentCampuses.filter((c) => c !== campus)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
      return { currentCampus: campus, recentCampuses: recent };
    });
  },

  clearHistory: () => {
    localStorage.removeItem(RECENT_KEY);
    set({ recentCampuses: [DEFAULT_CAMPUS], currentCampus: DEFAULT_CAMPUS });
  },
}));

export default useCampusStore;
