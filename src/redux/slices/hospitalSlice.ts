import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IReduxHospital {
  id: string;
  hospitalName: string;
  email: string;
  phone: string;
  isVerified: boolean;
}

interface HospitalState {
  isAuthenticated: boolean;
  hospital: IReduxHospital | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: HospitalState = {
  isAuthenticated: false,
  hospital: null,
  token: null,
  isLoading: true,
};

const hospitalSlice = createSlice({
  name: "hospital",
  initialState,
  reducers: {
    setHospital: (
      state,
      action: PayloadAction<{ hospital: IReduxHospital; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.hospital = action.payload.hospital;
      state.token = action.payload.token;
      state.isLoading = false;
    },

    setAuthHospital: (state, action: PayloadAction<IReduxHospital>) => {
      state.isAuthenticated = true;
      state.hospital = action.payload;
      state.isLoading = false;
    },

    clearHospital: (state) => {
      state.isAuthenticated = false;
      state.hospital = null;
      state.token = null;
      state.isLoading = false;
    },

    updateHospital: (state, action: PayloadAction<Partial<IReduxHospital>>) => {
      if (state.hospital) {
        state.hospital = { ...state.hospital, ...action.payload };
      }
    },

    setHospitalToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = Boolean(state.hospital);
    },

    setHospitalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setHospital,
  setAuthHospital,
  clearHospital,
  updateHospital,
  setHospitalToken,
  setHospitalLoading,
} = hospitalSlice.actions;

export default hospitalSlice.reducer;
