"use client"

import { useState, useEffect, useRef, useMemo, useSyncExternalStore, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { stopTyping } from '@/app/state/slices/typingdataSlice'
import colorSchemeOptions from '@/app/state/colorSchemeOptions'
import calculateUpdatedScore from '@/app/utils/score'
import {updateAccountAnalyticsAction} from '@/app/actions/analyticsAction'
import {updateAnalytics} from '@/app/state/slices/userdataSlice'
import { performLogout } from '@/app/utils/logoutUtil'
import { updateScore, markScoreSyncStart, markScoreSynced, markScoreSyncFailed } from '@/app/state/slices/userscoreSlice'
const Paragraph = ({ onFocusChange }) => {
    const dispatch = useDispatch()
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )

    const id = useSelector((state) => state.colorscheme.id)
    const lines = useSelector((state) => state.typingdata.editedParaLines)
    const userSelectedTime = useSelector((state) => state.typingdata.selectedTime)
    const isBailedOut = useSelector(state => state.typingdata.isBailedOut);
    const {isLoggedIn,wpm, accuracy, testTimings, lastTestTaken, totalPar, maxStreak } = useSelector((state) => state.userdata)

    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [currentInput, setCurrentInput] = useState('')
    const [typedWords, setTypedWords] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const [typedWordCount, setTypedWordCount] = useState(0)
    const [totalWordCount, setTotalWordCount] = useState(0)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    const boxRef = useRef(null)
    const hiddenInputRef = useRef(null)
    const hasEndedByTimerRef = useRef(false)
    const elapsedSecondsRef = useRef(0)
    const isLoggedInRef = useRef(isLoggedIn)
    const prevSpecsRef = useRef({
        wpm,
        accuracy,
        testTimings,
        lastTestTaken,
        totalPar,
        maxStreak
    })
    const typingStatsRef = useRef({
        typedWords: 0,
        wrongWordsCount: 0,
        wrongWords: []
    })

    const words = useMemo(
        () => lines.join(' ').trim().split(/\s+/).filter(Boolean),
        [lines]
    )
    const isParagraphLoading = words.length === 0

    const activeTheme = useMemo(
        () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
        [id]
    )

    const timeRemaining = useMemo(() => {
        if (!userSelectedTime || Number(userSelectedTime) <= 0) return null
        return Math.max(Number(userSelectedTime) - elapsedSeconds, 0)
    }, [userSelectedTime, elapsedSeconds])

    const hasSelectedTime = useMemo(
        () => Number(userSelectedTime) > 0,
        [userSelectedTime]
    )

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
        onFocusChange?.(isFocused)
    }, [isFocused, onFocusChange])

    useEffect(() => {
        const resetTimeout = setTimeout(() => {
            hasEndedByTimerRef.current = false
            setTotalWordCount(words.length)
            setTypedWordCount(0)
            setElapsedSeconds(0)
            elapsedSecondsRef.current = 0
            setCurrentWordIndex(0)
            setCurrentInput('')
            setTypedWords([])
            typingStatsRef.current = {
                typedWords: 0,
                wrongWordsCount: 0,
                wrongWords: []
            }
        }, 0)

        return () => clearTimeout(resetTimeout)
    }, [words])

    useEffect(() => {
        elapsedSecondsRef.current = elapsedSeconds
    }, [elapsedSeconds])

    useEffect(() => {
        isLoggedInRef.current = isLoggedIn
    }, [isLoggedIn])

    useEffect(() => {
        prevSpecsRef.current = {
            wpm,
            accuracy,
            testTimings,
            lastTestTaken,
            totalPar,
            maxStreak
        }
    }, [wpm, accuracy, testTimings, lastTestTaken, totalPar, maxStreak])

    useEffect(() => {
        if (!isFocused) return
        if (hasSelectedTime && timeRemaining === 0) return

        const interval = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isFocused, hasSelectedTime, timeRemaining])
    
     const storeNewTokens = (response) => {
        const accessToken = response?.newTokens?.accessToken
        const refreshToken = response?.newTokens?.refreshToken

        if (accessToken) {
        localStorage.setItem("access_token", accessToken)
        }

        if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken)
        }
    }
    const handleUpdateAnalytics = useCallback(async(dbScore) => {
        if (!dbScore) return

        dispatch(markScoreSyncStart())

        const access_token = localStorage.getItem("access_token")
        const refresh_token = localStorage.getItem("refresh_token")

        if (!access_token || !refresh_token) {
            dispatch(markScoreSyncFailed())
            performLogout()
            return
        }

        const payload={
            access_token,
            refresh_token,
            wpm : dbScore.wpm,
            accuracy : dbScore.accuracy,
            testTimings : dbScore.testTimings,
            maxStreak : dbScore.maxStreak,
            lastTestTaken : dbScore.lastTestTaken,
        }


        const response = await updateAccountAnalyticsAction(payload)
        
        if (response?.status === 401 || response?.status === 403) {
            dispatch(markScoreSyncFailed())
            performLogout()
            return
        }

        
        if (!response?.success) {
            dispatch(markScoreSyncFailed())
            console.error("Failed to update analytics:", response?.message || "Unknown error")
            return
        }
        
        storeNewTokens(response)

        dispatch(updateAnalytics({
            wpm : dbScore.wpm,
            accuracy : dbScore.accuracy,
            testTimings : dbScore.testTimings,
            maxStreak : dbScore.maxStreak,
            lastTestTaken : dbScore.lastTestTaken,
            totalPar : dbScore.totalPar,
            progress: [...(response?.data?.progress || [])]
        }))

        dispatch(markScoreSynced())
    }, [dispatch])

    const findScore = useCallback(() => {
        const currSpecs = {
            wrongWordsCount : typingStatsRef.current.wrongWordsCount,
            totalWordsCount : typingStatsRef.current.typedWords,
            timeTaken : elapsedSecondsRef.current
        }

        const {currScore,dbScore} = calculateUpdatedScore(currSpecs, prevSpecsRef.current)

        if (!currScore?.success) {
            dispatch(updateScore({
                totalWordscount : currSpecs.totalWordsCount,
                wrongWordsCount : currSpecs.wrongWordsCount,
                correctWordsCount : Math.max(0, currSpecs.totalWordsCount - currSpecs.wrongWordsCount),
                timeTaken : currSpecs.timeTaken,
                wrongWords : typingStatsRef.current.wrongWords,
                decimal_accuracy : 0,
                int_accuracy : 0,
                decimal_rawWpm : 0,
                int_rawWpm : 0,
                decimal_netWpm : 0,
                int_netWpm : 0,
                decimal_finalScore : 0,
                int_finalScore : 0,
                needsDbSync : false
            }))

            return {
                currScore,
                dbScore: null
            }
        }

        dispatch(updateScore({
            totalWordscount : currScore.totalWordsCount,
            wrongWordsCount : currScore.wrongWordsCount,
            correctWordsCount : currScore.correctWordsCount,
            timeTaken : currScore.timeTaken,
            wrongWords : typingStatsRef.current.wrongWords,
            decimal_accuracy : currScore.decimal_accuracy,
            int_accuracy : currScore.int_accuracy,
            decimal_rawWpm : currScore.decimal_rawWpm,
            int_rawWpm : currScore.int_rawWpm,
            decimal_netWpm : currScore.decimal_netWpm,
            int_netWpm : currScore.int_netWpm,
            decimal_finalScore : currScore.decimal_finalScore,
            int_finalScore : currScore.int_finalScore,
            needsDbSync : !!dbScore
        }))

        return {
            currScore,
            dbScore
        }
    }, [dispatch])

    const handleEndTest = useCallback(() => {
        if (hasEndedByTimerRef.current) return
        hasEndedByTimerRef.current = true

        const { dbScore } = findScore()
        dispatch(stopTyping())

        if (isLoggedInRef.current && dbScore) {
            void handleUpdateAnalytics(dbScore)
        }

    }, [dispatch, findScore, handleUpdateAnalytics])

    useEffect(() => {
        if (!isBailedOut) {
            return
        }

        handleEndTest()
    }, [isBailedOut, handleEndTest])
    useEffect(() => {
        if (!userSelectedTime || Number(userSelectedTime) <= 0) return
        if (timeRemaining !== 0) return

        handleEndTest()
    }, [timeRemaining, userSelectedTime, handleEndTest])

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
            wrongWords: [
                ...typingStatsRef.current.wrongWords,
                {
                    expected: originalWord,
                    typed: currentInput,
                    isCorrect: !isWrongWord
                }
            ]
        }

        setCurrentInput('')
        const nextIndex = Math.min(currentWordIndex + 1, words.length)
        setCurrentWordIndex(nextIndex)
        setTypedWordCount(nextIndex)

        if (nextIndex >= words.length) {
            handleEndTest()
        }
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

    const focusTyping = useCallback(() => {
        setIsFocused(true)
        hiddenInputRef.current?.focus()
    }, [])

    useEffect(() => {
        if (isFocused || isParagraphLoading) return

        const handleGlobalFocusKey = (event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return

            const target = event.target
            const isTypingTarget = target instanceof HTMLElement && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            )
            if (isTypingTarget) return

            event.preventDefault()
            focusTyping()
        }

        window.addEventListener('keydown', handleGlobalFocusKey)
        return () => window.removeEventListener('keydown', handleGlobalFocusKey)
    }, [isFocused, isParagraphLoading, focusTyping])

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
                'transition-colors',
                'duration-150',
                'ease-out',
                isWrongChar ? 'text-red-600' : ''
            ].filter(Boolean).join(' ')
            const charStyle = isCorrectChar
                ? { color: activeTheme.textColor2 }
                : undefined

            chars.push(
                <span key={`${wordGlobalIndex}-${i}`} className={charClassName} style={charStyle}>
                    {showCaretBeforeChar && (
                        <span
                            className='absolute left-0 top-0 h-full border-l-2 -translate-x-px caret-blink caret-smooth'
                            style={{ borderColor: activeTheme.textColor2 }}
                        />
                    )}
                    {word[i]}
                    {showCaretAtWordEnd && (
                        <span
                            className='absolute right-0 top-0 h-full border-l-2 translate-x-full caret-blink caret-smooth'
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
    const shouldBlurParagraph = !isFocused && !isParagraphLoading

    if (!isClient) return null

    return (
        <>
            <style jsx global>{`
                @keyframes caretBlink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                }

                @keyframes typingLoaderPulse {
                    0%, 100% { opacity: 0.35; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.08); }
                }

                .caret-blink {
                    animation: caretBlink 1s steps(1, end) infinite;
                }

                .caret-smooth {
                    transition: transform 110ms ease-out, opacity 110ms ease-out;
                    will-change: transform, opacity;
                }

                .typing-loader-dot {
                    animation: typingLoaderPulse 1.1s ease-in-out infinite;
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

                    {timeRemaining === null && (
                        <>
                            <span className='opacity-75'>Time elapsed</span>
                            <span className='font-semibold' style={{ color: activeTheme.textColor2 }}>
                                {`${elapsedSeconds}s`}
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
                    className='relative w-[80vw] p-4 font-mono text-3xl leading-relaxed tracking-wide cursor-text select-none rounded-xl min-h-64 flex flex-col justify-between'
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

                    <div
                        style={{
                            filter: shouldBlurParagraph ? 'blur(3px)' : 'none',
                            opacity: shouldBlurParagraph ? 0.35 : 1,
                            transition: 'filter 180ms ease, opacity 180ms ease'
                        }}
                    >
                        {isParagraphLoading ? (
                            <div className='h-40 flex items-center justify-center'>
                                <div className='flex flex-col items-center gap-4'>
                                    <div className='flex items-center gap-2'>
                                        <span className='typing-loader-dot h-2.5 w-2.5 rounded-full' style={{ backgroundColor: activeTheme.textColor2 }} />
                                        <span className='typing-loader-dot h-2.5 w-2.5 rounded-full' style={{ animationDelay: '0.2s', backgroundColor: activeTheme.textColor2 }} />
                                        <span className='typing-loader-dot h-2.5 w-2.5 rounded-full' style={{ animationDelay: '0.4s', backgroundColor: activeTheme.textColor2 }} />
                                    </div>
                                    <p className='text-sm opacity-80' style={{ color: activeTheme.textColor2 }}>
                                        Preparing paragraph...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            visibleLineRanges.map((lineData, lineOffset) => {
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
                            })
                        )}
                    </div>

                    {!isFocused && !isParagraphLoading && (
                        <div
                            className='absolute inset-0 z-10 flex items-center justify-center pointer-events-none'
                            style={{ color: activeTheme.textColor2 }}
                        >
                            <div className='text-sm sm:text-2xl font-medium opacity-90'>
                                Click here or press any key to focus
                            </div>
                        </div>
                    )}

                    <div
                        className='mt-4 text-xs sm:text-sm font-medium opacity-90 text-left'
                        style={{
                            filter: shouldBlurParagraph ? 'blur(1.5px)' : 'none',
                            opacity: shouldBlurParagraph ? 0.35 : 0.9,
                            transition: 'filter 180ms ease, opacity 180ms ease'
                        }}
                    >
                        Press Ctrl + Q and select bail out to end the test
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}

export default Paragraph
