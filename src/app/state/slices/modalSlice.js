import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    searchModalOpen : false,
    refreshDate : null
}
const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers : {
        toggleSearchModal : (state) => {
            state.searchModalOpen = !state.searchModalOpen;
        },
        setRefreshDate : (state, action) => {
            state.refreshDate = action.payload.newDate;
        }
    }
})

export const { toggleSearchModal , setRefreshDate} = modalSlice.actions;
export default modalSlice.reducer;