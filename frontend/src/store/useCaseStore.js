import { create } from 'zustand';

const API_BASE = '';

export const useCaseStore = create((set, get) => ({
  cases: [],
  analytics: null,
  selectedCaseId: null,
  selectedCase: null,
  loading: false,
  error: null,
  filterStatus: 'ALL',
  searchQuery: '',

  setSelectedCaseId: (caseId) => {
    const allCases = get().cases;
    const found = allCases.find((c) => c.case_id === caseId) || null;

    set({
      selectedCaseId: caseId,
      selectedCase: found,
    });
  },

  setFilterStatus: (filterStatus) => set({ filterStatus }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  fetchCasesAndAnalytics: async () => {
    set({
      loading: true,
      error: null,
    });

    try {
      const [casesResponse, analyticsResponse] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/analytics'),
      ]);

      if (!casesResponse.ok) {
        throw new Error(
          `Failed to fetch cases: ${casesResponse.status}`
        );
      }

      if (!analyticsResponse.ok) {
        throw new Error(
          `Failed to fetch analytics: ${analyticsResponse.status}`
        );
      }

      const casesData = await casesResponse.json();
      const analyticsData = await analyticsResponse.json();

      const casesList = casesData.cases || [];

      const currentSelected = get().selectedCaseId;

      const initialSelected =
        casesList.find(
          (c) => c.case_id === currentSelected
        ) ||
        casesList[0] ||
        null;

      set({
        cases: casesList,
        analytics: analyticsData,
        selectedCase: initialSelected,
        selectedCaseId: initialSelected
          ? initialSelected.case_id
          : null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('API error:', err);

      set({
        error: err.message || 'Failed to load data',
        loading: false,
      });
    }
  },
}));
