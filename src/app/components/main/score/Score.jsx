"use client"

import {useSelector,useDispatch} from "react-redux"
import { backToTyping } from "@/app/state/slices/typingdataSlice";
const Score = () => {
    const dispatch = useDispatch();
    const backToTypingHandler = () => {
        dispatch(backToTyping());
    }
  return (
    <div>
      <button onClick={()=>backToTypingHandler()}>Back To Typing</button>
      Score here --- IGNORE ---
    </div>
  )
}

export default Score
