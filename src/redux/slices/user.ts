import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type utilState = {
  user: {
    _id?: string;
    access_token?: string;
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
  },
});

export const {  setUser } = utilSlice.actions;

export const util = (state: RootState) => state._persist;

export default utilSlice.reducer;
