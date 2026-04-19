import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Donor } from "../../features/findDoner/service/Donordata";

interface DonorState {
  donors: Donor[];
  total: number;
  page: number;
  totalPages: number;
  isFetching: boolean;
  loadingMore: boolean;
  error: string | null;
}

const initialState: DonorState = {
  donors: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isFetching: false,
  loadingMore: false,
  error: null,
};

const donorSlice = createSlice({
  name: "donors",
  initialState,
  reducers: {
    startFetch: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    startLoadMore: (state) => {
      state.loadingMore = true;
      state.error = null;
    },
    setResults: (
      state,
      action: PayloadAction<{
        donors: Donor[];
        total: number;
        page: number;
        totalPages: number;
        append?: boolean;
      }>
    ) => {
      const { donors, total, page, totalPages, append } = action.payload;
      state.donors = append ? [...state.donors, ...donors] : donors;
      state.total = total;
      state.page = page;
      state.totalPages = totalPages;
      state.isFetching = false;
      state.loadingMore = false;
    },
    clearDonors: (state) => {
      state.donors = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 1;
    },
    resetDonors: () => initialState,
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isFetching = false;
      state.loadingMore = false;
    },
  },
});

export const {
  startFetch,
  startLoadMore,
  setResults,
  clearDonors,
  resetDonors,
  setError,
} = donorSlice.actions;

export default donorSlice.reducer;
