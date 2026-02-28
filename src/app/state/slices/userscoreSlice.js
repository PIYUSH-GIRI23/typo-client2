import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    totalWordscount: 0,
    wrongWordsCount: 0,
    correctWordsCount: 0,
    timeTaken: 0,
    wrongWords: [],
    decimal_accuracy: 0,
    int_accuracy: 0,
    decimal_rawWpm: 0,
    int_rawWpm: 0,
    decimal_netWpm: 0,
    int_netWpm: 0,
    decimal_finalScore: 0,
    int_finalScore: 0,
    needsDbSync: false,
    dbSyncStatus: "idle"
}
const userscoreSlice = createSlice({
    name: "userscore",
    initialState,
    reducers : {
        updateScore : (state, action) => {
            state.totalWordscount = action.payload.totalWordscount;
            state.wrongWordsCount = action.payload.wrongWordsCount;
            state.correctWordsCount = action.payload.correctWordsCount;
            state.timeTaken = action.payload.timeTaken;
            state.wrongWords = action.payload.wrongWords;
            state.decimal_accuracy = action.payload.decimal_accuracy;
            state.int_accuracy = action.payload.int_accuracy;
            state.decimal_rawWpm = action.payload.decimal_rawWpm;
            state.int_rawWpm = action.payload.int_rawWpm;
            state.decimal_netWpm = action.payload.decimal_netWpm;
            state.int_netWpm = action.payload.int_netWpm;
            state.decimal_finalScore = action.payload.decimal_finalScore;
            state.int_finalScore = action.payload.int_finalScore;
            state.needsDbSync = action.payload.needsDbSync ?? true;
            state.dbSyncStatus = state.needsDbSync ? "pending" : "idle";
        },
        markScoreSyncStart : (state) => {
            state.dbSyncStatus = "syncing";
        },
        markScoreSynced : (state) => {
            state.needsDbSync = false;
            state.dbSyncStatus = "synced";
        },
        markScoreSyncFailed : (state) => {
            state.needsDbSync = true;
            state.dbSyncStatus = "failed";
        },
        resetScore : (state) => {
            state.totalWordscount = 0;
            state.wrongWordsCount = 0;
            state.correctWordsCount = 0;
            state.timeTaken = 0;
            state.wrongWords = [];
            state.decimal_accuracy = 0;
            state.int_accuracy = 0;
            state.decimal_rawWpm = 0;
            state.int_rawWpm = 0;
            state.decimal_netWpm = 0;
            state.int_netWpm = 0;
            state.decimal_finalScore = 0;
            state.int_finalScore = 0;
            state.needsDbSync = false;
            state.dbSyncStatus = "idle";
        }
    }
})

export const { updateScore, markScoreSyncStart, markScoreSynced, markScoreSyncFailed, resetScore } = userscoreSlice.actions;
export default userscoreSlice.reducer;