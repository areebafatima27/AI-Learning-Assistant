import { create } from 'zustand';

export const useStatsStore = create((set) => ({
  stats: {
    documentsProcessed: 0,
    questionsAsked: 0,
    flashcardsCreated: 0,
    quizzesCompleted: 0,
  },
  incrementDocuments: () =>
    set((state) => ({
      stats: {
        ...state.stats,
        documentsProcessed: state.stats.documentsProcessed + 1,
      },
    })),
}));
