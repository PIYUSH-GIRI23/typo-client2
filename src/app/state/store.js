
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistMiddleware, loadPersistedState } from "./persistMiddleware";

import colorschemeReducer from "./slices/colorschemeSlice";
import userdataReducer from "./slices/userdataSlice";
import typingdataReducer from "./slices/typingdataSlice";
import modalReducer from "./slices/modalSlice";
import userscoreReducer from "./slices/userscoreSlice";

const appReducer = combineReducers({
  colorscheme: colorschemeReducer,
  userdata: userdataReducer,
  typingdata: typingdataReducer,
  modal: modalReducer,
  userscore: userscoreReducer
});

const preloadedState =
  typeof window !== "undefined"
    ? loadPersistedState()
    : {};

export const store = configureStore({
  reducer: appReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistMiddleware),
});