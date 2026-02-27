"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setTypingStartTime } from '@/app/state/slices/typingdataSlice'
import colorSchemeOptions from "@/app/state/colorSchemeOptions"

const CustomTime = ({ isOpen, onClose }) => {
   const isClient = useSyncExternalStore(
      () => () => {},
      () => true,
      () => false
   )

   const dispatch = useDispatch()
   const id = useSelector((state) => state.colorscheme.id)
   const selectedTime = useSelector((state) => state.typingdata.selectedTime)

   const [error, setError] = useState({
      status: false,
      message: ''
   })
   const [time, setTime] = useState(selectedTime || "")
   const inputRef = useRef(null)

   const activeTheme = useMemo(
      () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
      [id]
   )

   const closeModal = useCallback(() => {
      onClose()
      setError({ status: false, message: '' })
   }, [onClose])

   const setTypingStartTimeHandler = useCallback(() => {
      const nextTime = Number(time)

      if (!Number.isInteger(nextTime) || nextTime < 1 || nextTime > 3600) {
         setError({
            status: true,
            message: 'Please enter a value between 1 and 3600 seconds'
         })
         return
      }

      dispatch(setTypingStartTime({ selectedTime: nextTime }))
      setError({ status: false, message: '' })
      onClose()
   }, [dispatch, time, onClose])

   useEffect(() => {
      if (!isOpen) return

      const handleKeyDown = (event) => {
         if (event.key === 'Escape') {
            closeModal()
         }

         if (event.key === 'Enter') {
            event.preventDefault()
            setTypingStartTimeHandler()
         }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
   }, [isOpen, closeModal, setTypingStartTimeHandler])

   useEffect(() => {
      if (!isOpen) return

      const focusTimeout = setTimeout(() => {
         inputRef.current?.focus()
         inputRef.current?.select()
      }, 0)

      return () => clearTimeout(focusTimeout)
   }, [isOpen])

   if (!isClient) return null

  return (
      isOpen ? (
         <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            style={{ backgroundColor: `${activeTheme.bgColor}cc` }}
         >
            <div
               className="w-full max-w-md rounded-2xl border p-5 shadow-2xl sm:p-6"
               style={{
                  backgroundColor: activeTheme.divColor,
                  borderColor: activeTheme.divColor2,
                  color: activeTheme.textColor
               }}
            >
               <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                     <h3 className="text-lg font-semibold" style={{ color: activeTheme.textColor2 }}>
                        Custom Timer
                     </h3>
                     <p className="mt-1 text-xs opacity-80">Set typing duration in seconds.</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-md border px-2 py-1 text-xs"
                        style={{ borderColor: activeTheme.divColor2 }}
                     >
                        Esc
                     </button>
                     <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close modal"
                        className="rounded-md border px-2 py-1 text-sm leading-none"
                        style={{ borderColor: activeTheme.divColor2, color: activeTheme.textColor2 }}
                     >
                        ✕
                     </button>
                  </div>
               </div>

               <label className="mb-2 block text-sm font-medium">Duration (seconds)</label>
               <input
                  ref={inputRef}
                  type="number"
                  min={1}
                  max={3600}
                  value={time}
                  onChange={(e) => {
                     setTime(e.target.value)
                     setError({ status: false, message: '' })
                  }}
                  placeholder="e.g. 60"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{
                     borderColor: activeTheme.divColor2,
                     backgroundColor: activeTheme.bgColor,
                     color: activeTheme.textColor
                  }}
               />

               <p className="mt-2 text-xs opacity-80">
                  Current selected: {selectedTime || 0} sec
               </p>

               {error.status && (
                  <p className="mt-3 text-sm text-red-400">{error.message}</p>
               )}

               <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                     type="button"
                     onClick={closeModal}
                     className="rounded-lg border px-4 py-2 text-sm"
                     style={{ borderColor: activeTheme.divColor2 }}
                  >
                     Cancel
                  </button>
                  <button
                     type="button"
                     onClick={setTypingStartTimeHandler}
                     className="rounded-lg border px-4 py-2 text-sm font-medium"
                     style={{
                        borderColor: activeTheme.textColor2,
                        backgroundColor: activeTheme.textColor2,
                        color: activeTheme.bgColor
                     }}
                  >
                     Apply (Enter)
                  </button>
               </div>
            </div>
         </div>
      ) : null
  )
}

export default CustomTime
