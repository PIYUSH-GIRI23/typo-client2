import { createSlice } from "@reduxjs/toolkit";

const initialState =  {
    refreshDate : null,
    accountModal:1,
    commandModalOpen: false
}

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers : {
        setRefreshDate : (state, action) => {
            state.refreshDate = action.payload.newDate;
        },
        setAccountModal : (state, action) => {
            state.accountModal = action.payload.value
        },
        setCommandModalOpen : (state, action) => {
            state.commandModalOpen = action.payload.value
        },
        toggleCommandModal : (state) => {
            state.commandModalOpen = !state.commandModalOpen
        }
    }
})

export const { setRefreshDate , setAccountModal, setCommandModalOpen, toggleCommandModal } = modalSlice.actions;
export default modalSlice.reducer;