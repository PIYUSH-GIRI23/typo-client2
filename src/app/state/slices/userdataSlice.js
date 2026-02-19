import { createSlice } from "@reduxjs/toolkit";
import { loadPersistedState } from "../persistMiddleware";

const persistedState = loadPersistedState();
const initialState = persistedState.userdata || {
    isLoggedIn : false,
    email : '',
    username : '',
    firstName : '',
    lastName : '',
    lastLogin : null,
    wpm: 0,
    accuracy: 0,
    testTimings: 0,
    lastTestTaken: null,
    totalPar: 0,
    maxStreak: 0,
    progress: []
}
const userdataSlice = createSlice({
    name: "userdata",
    initialState,
    reducers : {
        login : (state, action) => {
            state.isLoggedIn = true;
            state.email = action.payload.email;
            state.username = action.payload.username;
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.lastLogin = action.payload.lastLogin;
        },
        logout : (state) => {
            state.isLoggedIn = false;
            state.email = '';
            state.username = '';
            state.firstName = '';
            state.lastName = '';
            state.lastLogin = null;
            state.wpm = 0;
            state.accuracy = 0;
            state.testTimings = 0;
            state.lastTestTaken = null;
            state.totalPar = 0;
            state.maxStreak = 0;
            state.progress = [];
        },
        updateUsername : (state, action) => {
            state.username = action.payload.username
        },
        updateUserData : (state, action) => {
            state.wpm = action.payload.wpm;
            state.accuracy = action.payload.accuracy;
            state.testTimings = action.payload.testTimings;
            state.lastTestTaken = action.payload.lastTestTaken;
            state.totalPar = action.payload.totalPar;
            state.maxStreak = action.payload.maxStreak;
            state.progress = action.payload.progress;
        },
        updateAnalytics : (state, action) => {
            state.wpm = action.payload.wpm;
            state.accuracy = action.payload.accuracy;
            state.testTimings = action.payload.testTimings;
            state.lastTestTaken = action.payload.lastTestTaken;
            state.totalPar = action.payload.totalPar;
            state.maxStreak = action.payload.maxStreak;
            state.progress = action.payload.progress;
        },
        resetAnalytics : (state) => {
            state.wpm = 0;
            state.accuracy = 0;
            state.testTimings = 0;
            state.lastTestTaken = null;
            state.totalPar = 0;
            state.maxStreak = 0;
            state.progress = [];
        }
    }
})

export const { login, logout, updateUsername, updateUserData, updateAnalytics, resetAnalytics } = userdataSlice.actions;
export default userdataSlice.reducer;