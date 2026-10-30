import { create } from 'zustand';

const API_BASE = window.location.port === '5173' ? '' : 'http://127.0.0.1:8000';

export const useCaseStore = create((set, get) => ({
  cases: [],
  analytics: null,
  selectedCaseId: null,
  selectedCase: null,
  loading: false,
  error: null,
  filterStatus: 'ALL', // 'ALL', 'CRITICAL', 'HIGH', 'COMPLIANT'
  searchQuery: '',

  setSelectedCaseId: (caseId) => {
    const allCases = get().cases;
    const found = allCases.find((c) => c.case_id === caseId) || null;
    set({ selectedCaseId: caseId, selectedCase: found });
  },

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  fetchCasesAndAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const [casesRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/api/cases`).then((r) => {
          if (!r.ok) throw new Error('Failed to fetch cases');
          return r.json();
        }),
        fetch(`${API_BASE}/api/analytics`).then((r) => {
          if (!r.ok) throw new Error('Failed to fetch analytics');
          return r.json();
        }),
      ]);

      const casesList = casesRes.cases || [];
      const currentSelected = get().selectedCaseId;
      const initialSelected =
        casesList.find((c) => c.case_id === currentSelected) || casesList[0] || null;

      set({
        cases: casesList,
        analytics: analyticsRes,
        selectedCase: initialSelected,
        selectedCaseId: initialSelected ? initialSelected.case_id : null,
        loading: false,
      });
    } catch (err) {
      console.warn('API error, using local fallback state:', err);
      set({
        error: err.message,
        loading: false,
      });
    }
  },
}));
