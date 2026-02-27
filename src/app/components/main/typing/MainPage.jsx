"use client"

import {useSelector}  from 'react-redux'
import Paragraph from '@/app/components/main/typing/Paragraph';
import Menu from '@/app/components/main/typing/Menu';
import colorSchemeOptions from "@/app/state/colorSchemeOptions";
import {useSyncExternalStore,useMemo} from 'react'
const MainPage = () => {
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )
    const isTyping = useSelector(state => state.typingdata.isTyping);
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
          <Menu/>
          <Paragraph />
        </>:
        <>
          Score here
        </>
      }
    </div>
  )
}

export default MainPage
