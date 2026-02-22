import { createSlice } from "@reduxjs/toolkit";
import formatDateTime from "@/app/utils/formatDateTime";

const initialState =  {
    refreshDate : null,
    refreshDateTime : null,
    accountModal:1,
    commandModalOpen: false
}

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers : {
        setRefreshDate : (state, action) => {
            const incomingDate = action.payload?.newDate;

            if (incomingDate === null) {
                state.refreshDate = null;
                state.refreshDateTime = null;
                return;
            }

            const nextDate = typeof incomingDate === "number" ? incomingDate : Date.now();
            state.refreshDate = nextDate;
            state.refreshDateTime = formatDateTime(nextDate);
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