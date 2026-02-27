"use client"

import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react'
import { useSelector } from 'react-redux'
import colorSchemeOptions from '@/app/state/colorSchemeOptions'

const Paragraph = () => {
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )

    const id = useSelector((state) => state.colorscheme.id)
    const lines = useSelector((state) => state.typingdata.editedParaLines)
    const userSelectedTime = useSelector((state) => state.typingdata.selectedTime)

    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [currentInput, setCurrentInput] = useState('')
    const [typedWords, setTypedWords] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const [typedWordCount, setTypedWordCount] = useState(0)
    const [totalWordCount, setTotalWordCount] = useState(0)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    const boxRef = useRef(null)
    const hiddenInputRef = useRef(null)
    const typingStatsRef = useRef({
        typedWords: 0,
        wrongWordsCount: 0,
        wrongWords: []
    })

    const words = useMemo(
        () => lines.join(' ').trim().split(/\s+/).filter(Boolean),
        [lines]
    )

    const activeTheme = useMemo(
        () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
        [id]
    )

    const timeRemaining = useMemo(() => {
        if (!userSelectedTime || Number(userSelectedTime) <= 0) return null
        return Math.max(Number(userSelectedTime) - elapsedSeconds, 0)
    }, [userSelectedTime, elapsedSeconds])

    const lineWordRanges = useMemo(() => {
        let nextWordIndex = 0
        const ranges = []

        for (const line of lines) {
            const lineWords = line.split(' ').filter(Boolean)
            const start = nextWordIndex
            const end = start + lineWords.length - 1

            ranges.push({
                lineWords,
                start,
                end
            })

            nextWordIndex += lineWords.length
        }

        return ranges
    }, [lines])

    const lineIndex = useMemo(() => {
        const completedLines = lineWordRanges.filter(
            (line) => line.end < currentWordIndex
        ).length

        const maxStartIndex = Math.max(lines.length - 3, 0)
        return Math.min(completedLines, maxStartIndex)
    }, [currentWordIndex, lineWordRanges, lines.length])

    useEffect(() => {
        const onMouseDownOutside = (event) => {
            if (!boxRef.current) return

            if (!boxRef.current.contains(event.target)) {
                setIsFocused(false)
                hiddenInputRef.current?.blur()
            }
        }

        document.addEventListener('mousedown', onMouseDownOutside)

        return () => {
            document.removeEventListener('mousedown', onMouseDownOutside)
        }
    }, [])

    useEffect(() => {
        const resetTimeout = setTimeout(() => {
            setTotalWordCount(words.length)
            setTypedWordCount(0)
            setElapsedSeconds(0)
            setCurrentWordIndex(0)
            setCurrentInput('')
            setTypedWords([])
        }, 0)

        return () => clearTimeout(resetTimeout)
    }, [words])

    useEffect(() => {
        if (!isFocused || !userSelectedTime || Number(userSelectedTime) <= 0) return
        if (timeRemaining === 0) return

        const interval = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isFocused, userSelectedTime, timeRemaining])

    const moveToNextWord = () => {
        if (currentWordIndex >= words.length) return

        const originalWord = words[currentWordIndex] || ''
        const isWrongWord = currentInput !== originalWord

        setTypedWords((prev) => {
            const next = [...prev]
            next[currentWordIndex] = currentInput
            return next
        })

        typingStatsRef.current = {
            typedWords: typingStatsRef.current.typedWords + 1,
            wrongWordsCount: typingStatsRef.current.wrongWordsCount + (isWrongWord ? 1 : 0),
            wrongWords: isWrongWord
                ? [...typingStatsRef.current.wrongWords, currentInput]
                : typingStatsRef.current.wrongWords
        }

        setCurrentInput('')
        setCurrentWordIndex((prev) => {
            const nextIndex = Math.min(prev + 1, words.length)
            setTypedWordCount(nextIndex)
            return nextIndex
        })
    }

    const handleKeyDown = (event) => {
        if (!isFocused) return

        const currentTargetWord = words[currentWordIndex] || ''

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()

            if (currentInput.length < currentTargetWord.length) return

            moveToNextWord()
            return
        }

        if (event.key === 'Backspace') {
            event.preventDefault()
            setCurrentInput((prev) => prev.slice(0, -1))
            return
        }

        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()

            if (currentInput.length >= currentTargetWord.length) return

            setCurrentInput((prev) => prev + event.key)
        }
    }

    const focusTyping = () => {
        setIsFocused(true)
        hiddenInputRef.current?.focus()
    }

    const renderWord = (word, wordGlobalIndex) => {
        const isCompletedWord = wordGlobalIndex < currentWordIndex
        const isCurrentWord = wordGlobalIndex === currentWordIndex
        const typedText = isCompletedWord
            ? (typedWords[wordGlobalIndex] || '')
            : isCurrentWord
                ? currentInput
                : ''

        const chars = []

        for (let i = 0; i < word.length; i++) {
            const isTypedChar = typedText[i] !== undefined
            const isWrongChar = typedText[i] !== undefined && typedText[i] !== word[i]
            const isCorrectChar = isTypedChar && typedText[i] === word[i]
            const showCaretBeforeChar = isCurrentWord && isFocused && i === typedText.length && typedText.length < word.length
            const showCaretAtWordEnd = isCurrentWord && isFocused && typedText.length >= word.length && i === word.length - 1
            const charClassName = [
                'relative',
                isWrongChar ? 'text-red-600' : ''
            ].filter(Boolean).join(' ')
            const charStyle = isCorrectChar
                ? { color: activeTheme.textColor2 }
                : undefined

            chars.push(
                <span key={`${wordGlobalIndex}-${i}`} className={charClassName} style={charStyle}>
                    {showCaretBeforeChar && (
                        <span
                            className='absolute left-0 top-0 h-full border-l-2 -translate-x-px caret-blink'
                            style={{ borderColor: activeTheme.textColor2 }}
                        />
                    )}
                    {word[i]}
                    {showCaretAtWordEnd && (
                        <span
                            className='absolute right-0 top-0 h-full border-l-2 translate-x-full caret-blink'
                            style={{ borderColor: activeTheme.textColor2 }}
                        />
                    )}
                </span>
            )
        }

        return chars
    }

    const visibleLineRanges = lineWordRanges.slice(
        lineIndex,
        Math.min(lineIndex + 3, lineWordRanges.length)
    )

    if (!isClient) return null

    return (
        <>
            <style jsx global>{`
                @keyframes caretBlink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                }

                .caret-blink {
                    animation: caretBlink 1s steps(1, end) infinite;
                }
            `}</style>

            <div className='flex items-center justify-center mt-8 flex-col w-full gap-3'>
            <div
                className='w-[80vw] px-4 py-2 flex items-center justify-between mt-5'
                style={{
                    color: activeTheme.textColor
                }}
            >
                <div className='flex items-center gap-2 text-sm sm:text-base'>
                    <span style={{ color: activeTheme.textColor2 }} className='font-semibold'>Progress</span>
                    <span className='font-bold'>{typedWordCount}</span>
                    <span>/</span>
                    <span className='font-bold'>{totalWordCount}</span>
                    <span className='opacity-75'>words</span>
                </div>

                <div className='flex items-center gap-2 text-xs sm:text-sm'>
                    {timeRemaining !== null && (
                        <>
                            <span className='opacity-75'>Time left</span>
                            <span className='font-semibold' style={{ color: activeTheme.textColor2 }}>
                                {`${timeRemaining}s`}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div>
                <div
                    id='typing-box'
                    ref={boxRef}
                    onClick={focusTyping}
                    className='w-[80vw] p-4 font-mono text-3xl leading-relaxed tracking-wide cursor-text select-none rounded-xl min-h-64 flex flex-col justify-between'
                    style={{
                        
                        color: activeTheme.textColor
                    }}
                >
                    <input
                        ref={hiddenInputRef}
                        onKeyDown={handleKeyDown}
                        className='absolute opacity-0 pointer-events-none'
                        aria-hidden='true'
                    />

                    <div>
                        {visibleLineRanges.map((lineData, lineOffset) => {
                            const { lineWords, start } = lineData

                            return (
                                <div key={`line-${lineIndex + lineOffset}`} className='whitespace-nowrap'>
                                    {lineWords.map((word, wordOffset) => {
                                        const globalWordIndex = start + wordOffset

                                        return (
                                            <span key={`word-${globalWordIndex}`}>
                                                {renderWord(word, globalWordIndex)}
                                                {wordOffset < lineWords.length - 1 ? ' ' : ''}
                                            </span>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>

                    <div className='mt-4 text-xs sm:text-sm font-medium opacity-90 text-left'>
                        Press Ctrl + Q and select bail out to end the test
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}

export default Paragraph
