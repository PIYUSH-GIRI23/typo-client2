"use client"

import {useSelector}  from 'react-redux'
import Paragraph from '@/app/components/main/typing/Paragraph';
import Menu from '@/app/components/main/typing/Menu';
import colorSchemeOptions from "@/app/state/colorSchemeOptions";
import Score from '@/app/components/main/score/Score';  
import {useSyncExternalStore,useMemo, useState} from 'react'
const MainPage = () => {
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )
    const isTyping = useSelector(state => state.typingdata.isTyping);
    const [isParagraphFocused, setIsParagraphFocused] = useState(false)
    const id = useSelector((state) => state.colorscheme.id)
    const activeTheme = useMemo(
        () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
        [id]
    )

    if (!isClient) return null
  return (
    <div className='min-h-[89vh] md:h-[89vh] overflow-y-auto' style={{
        backgroundColor: activeTheme.bgColor,
    }}>
      {
        isTyping ?
        <>
          <Menu isHidden={isParagraphFocused} />
          <Paragraph onFocusChange={setIsParagraphFocused} />
        </>:
        <>
          <Score/>
        </>
      }
    </div>
  )
}

export default MainPage
