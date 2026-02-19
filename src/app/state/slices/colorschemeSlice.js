import { createSlice } from "@reduxjs/toolkit";
import { loadPersistedState } from "../persistMiddleware";

const persistedState = loadPersistedState();
const initialState = persistedState.colorscheme || {
    id:1
}
const colorschemeSlice = createSlice({
    name: "colorscheme",
    initialState,
    reducers : {
        setColorScheme : (state, action) => {
            state.id = action.payload.id;
        }
    }
})

export const { setColorScheme } = colorschemeSlice.actions;
export default colorschemeSlice.reducer;