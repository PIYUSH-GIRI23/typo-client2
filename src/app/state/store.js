import { configureStore } from "@reduxjs/toolkit";
import { persistMiddleware } from "./persistMiddleware";
import { loadPersistedState } from "./persistMiddleware";

import colorschemeReducer from "./slices/colorschemeSlice";
import userdataReducer from "./slices/userdataSlice";
import typingdataReducer from "./slices/typingdataSlice";
import modalReducer from "./slices/modalSlice";

const preloadedState = loadPersistedState();

export const store = configureStore({
  reducer: {
    colorscheme: colorschemeReducer,
    userdata: userdataReducer,
    typingdata: typingdataReducer,
    modal: modalReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistMiddleware),
});