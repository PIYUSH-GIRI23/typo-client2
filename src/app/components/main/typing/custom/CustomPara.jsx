"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setTypingParaLines } from '@/app/state/slices/typingdataSlice'
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import paraToLines from '@/app/utils/paraToLines'

const CustomPara = ({ isOpen, onClose }) => {
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )

    const dispatch = useDispatch()
    const id = useSelector((state) => state.colorscheme.id)
    const { originalPara, totalWords } = useSelector((state) => state.typingdata)

    const [paraLength, setParaLength] = useState(totalWords || "")
    const inputRef = useRef(null)
    const [error, setError] = useState({
        status: false,
        message: ''
    })

    const activeTheme = useMemo(
        () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
        [id]
    )

    const closeModal = useCallback(() => {
        onClose()
        setError({ status: false, message: '' })
    }, [onClose])

    const getTypingBoxMetrics = useCallback(() => {
        if (typeof window === 'undefined') return null;

        const element = document.getElementById('typing-box');
        if (!element) return null;

        const style = window.getComputedStyle(element);
        const width = element.clientWidth;
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;
        const letterSpacing = parseFloat(style.letterSpacing) || 0;
        const wordSpacing = parseFloat(style.wordSpacing) || 0;
        const usableWidth = width - paddingLeft - paddingRight;

        const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

        return {
        usableWidth,
        font,
        letterSpacing,
        wordSpacing
        };
    }, []);

    const setTypingParaLinesHandler = useCallback(() => {
        const nextLength = Number(paraLength)

        if (!Number.isInteger(nextLength) || nextLength < 1 || nextLength > totalWords) {
            setError({
                status: true,
                message: `Please enter a value between 1 and ${totalWords}`
            })
            return
        }

        const words = originalPara.trim().split(/\s+/).filter(Boolean)
        const newPara = words.slice(0, nextLength).join(' ')
        const metrics = getTypingBoxMetrics()
        const paraLines = paraToLines(
                            newPara,
                            metrics.usableWidth,
                            metrics.font,
                            metrics.letterSpacing,
                            metrics.wordSpacing
                           );

        dispatch(setTypingParaLines({
            para: newPara,
            paraLines
        }))

        setError({ status: false, message: '' })
        onClose()
    }, [dispatch, originalPara, paraLength, totalWords, onClose, getTypingBoxMetrics])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal()
            }

            if (event.key === 'Enter') {
                event.preventDefault()
                setTypingParaLinesHandler()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, closeModal, setTypingParaLinesHandler])

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
                                Custom Paragraph Length
                            </h3>
                            <p className="mt-1 text-xs opacity-80">Enter number of words to include.</p>
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

                    <label className="mb-2 block text-sm font-medium">Number of words</label>
                    <input
                        ref={inputRef}
                        type="number"
                        min={1}
                        max={totalWords || 1}
                        value={paraLength}
                        onChange={(e) => {
                            setParaLength(e.target.value)
                            setError({ status: false, message: '' })
                        }}
                        placeholder="e.g. 50"
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{
                            borderColor: activeTheme.divColor2,
                            backgroundColor: activeTheme.bgColor,
                            color: activeTheme.textColor
                        }}
                    />

                    <p className="mt-2 text-xs opacity-80">
                        Selected: {Number(paraLength) || 0}/{totalWords || 0} words
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
                            onClick={setTypingParaLinesHandler}
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

export default CustomPara
