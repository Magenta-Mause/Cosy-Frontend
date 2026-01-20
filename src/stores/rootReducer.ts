import { combineReducers } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useSelector } from "react-redux";
import { gameServerLogSliceReducer } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerSliceReducer } from "@/stores/slices/gameServerSlice.ts";
import { userInviteSliceReducer } from "@/stores/slices/userInviteSlice.ts";
import { userSliceReducer } from "@/stores/slices/userSlice.ts";
import type { RootState } from ".";
import { gameServerMetricsSliceReducer } from "./slices/gameServerMetrics";

const appReducer = combineReducers({
  gameServerSliceReducer,
  userInviteSliceReducer,
  gameServerLogSliceReducer,
  gameServerMetricsSliceReducer,
  userSliceReducer,
});

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default appReducer;
