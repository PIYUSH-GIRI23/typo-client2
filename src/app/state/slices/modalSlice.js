import { createSlice } from "@reduxjs/toolkit";
import { loadPersistedState } from "../persistMiddleware";

const persistedState = loadPersistedState();
const initialState = persistedState.modal || {
    searchModalOpen : false,
}
const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers : {
        toggleSearchModal : (state) => {
            state.searchModalOpen = !state.searchModalOpen;
        }
    }
})

export const { toggleSearchModal } = modalSlice.actions;
export default modalSlice.reducer;