import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type utilState = {
  user: {
    _id?: string;
    access_token?: string;
    name?: string;
    email?: string;
    credits?: string;
    phone?: string;
    access_code?: string;
    roles?: string;
  };
};

const initialState: utilState = {
  user: {},
};

export const utilSlice = createSlice({
  name: "util",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<object>) => {
      state.user = action.payload;
    },
    logOutUser: (state) => {
      state.user = {};
    },
  },
});

export const { setUser, logOutUser } = utilSlice.actions;

export const util = (state: RootState) => state._persist;

export default utilSlice.reducer;
