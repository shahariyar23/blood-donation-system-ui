// src/redux/adminSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface IUser {
  userInfo: { email: string } | null;
}

const initialState: IUser = {
  userInfo: null,
};

export const userSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setuserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    logoutUser: (state) => {
      state.userInfo = null;
    },
  },
});

export const { setuserInfo, logoutUser } = userSlice.actions;

export default userSlice.reducer;
