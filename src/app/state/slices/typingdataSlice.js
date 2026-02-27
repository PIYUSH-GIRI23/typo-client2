import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isTyping: true,
    isBailedOut: false,
    originalPara: '',
    paraLines: [],
    editedParaLines: [],
    totalWords:0,
    typedWords:0,
    wrongWordsCount:0,
    wrongWords:[],
    timeTaken:0,
    selectedTime: null,
    type:'para',
    punctuation:false,
    numbers:false,
    symbols:false,
    length:"short",
    difficulty:"easy"
}
const typingSlice = createSlice({
    name : "typingdata",
    initialState,
    reducers:{
        startAndResetTyping : (state, action) => {
            state.isTyping = true;
            state.isBailedOut = false;
            state.originalPara = action.payload.para;
            state.paraLines = action.payload.paraLines,
            state.editedParaLines = action.payload.paraLines,
            state.totalWords = action.payload.para.split(' ').length;
            state.typedWords = 0;
            state.wrongWordsCount = 0;
            state.wrongWords = [];
            state.timeTaken = 0;
            state.selectedTime = null;
            state.type = "para",
            state.punctuation = false,
            state.numbers = false,
            state.symbols = false,
            state.length = "short",
            state.difficulty = "easy"
        },
        updateStats : (state, action) => {
            state.typedWords = action.payload.typedWords;
            state.wrongWordsCount = action.payload.wrongWordsCount;
            state.wrongWords = action.payload.wrongWords;
            state.timeTaken = action.payload.timeTaken;
        },
        setTypingStartTime : (state, action) => {
            state.selectedTime = action.payload.selectedTime;
        },
        setTypingParaLines : (state, action) => {
            state.originalPara = action.payload.para;
            state.paraLines = action.payload.paraLines;
        },
        updateParaLines : (state, action) => {
            state.editedParaLines = action.payload.editedParaLines;
        },
        stopTyping : (state) => {
            state.isTyping = false;
        },
        bailOut : (state) => {
            state.isBailedOut = true;
        },
        togglePunctuation : (state) => {
            state.punctuation = !state.punctuation;
        },
        toggleNumbers : (state) => {
            state.numbers = !state.numbers;
        },
        toggleSymbols : (state) => {
            state.symbols = !state.symbols;
        },
        changeType : (state,action) => {
            state.type = action.payload.type;
        },
        changeDifficulty : (state,action) => {
            state.difficulty = action.payload.difficulty;
        },
        changeLength : (state,action) => {
            state.length = action.payload.length;
        }
    }
})
export const { startAndResetTyping, updateStats, setTypingStartTime, updateParaLines, stopTyping, bailOut, togglePunctuation, toggleNumbers, toggleSymbols , changeType, changeDifficulty, changeLength, setTypingParaLines} = typingSlice.actions;
export default typingSlice.reducer;