"use client"

import { useEffect } from 'react';
import {useSelector, useDispatch}  from 'react-redux'
import { stopTyping } from "@/app/state/slices/typingdataSlice";
const BailOut = () => {
    const isBailedOut = useSelector(state => state.typingdata.isBailedOut);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isBailedOut) {
        dispatch(stopTyping());
        }
    }, [isBailedOut, dispatch]);

  return null;
}

export default BailOut
