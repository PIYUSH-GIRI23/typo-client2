import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    isTyping: true,
    isBailedOut: false,
    originalPara: '',
    editedPara: '',
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
}
const typingSlice = createSlice({
    name : "typingdata",
    initialState,
    reducers:{
        startAndResetTyping : (state, action) => {
            state.isTyping = true;
            state.isBailedOut = false;
            state.originalPara = action.payload.para;
            state.editedPara = action.payload.para;
            state.totalWords = action.payload.para.split(' ').length;
            state.typedWords = 0;
            state.wrongWordsCount = 0;
            state.wrongWords = [];
            state.timeTaken = 0;
            state.selectedTime = null,
            state.type = 'para'
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
        updateEditedPara : (state, action) => {
            state.editedPara = action.payload.editedPara;
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
        }
    }
})
export const { startAndResetTyping, updateStats, setTypingStartTime, updateEditedPara, stopTyping, bailOut, togglePunctuation, toggleNumbers, toggleSymbols } = typingSlice.actions;
export default typingSlice.reducer;