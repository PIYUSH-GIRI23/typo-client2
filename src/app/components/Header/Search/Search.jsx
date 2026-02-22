"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import { setCommandModalOpen, toggleCommandModal } from "@/app/state/slices/modalSlice"
import searchData from "@/app/components/Header/Search/searchData"
import {
  analyticsAction,
  bailoutAction,
  changeColorTheme,
  leaderboardAction,
  loginAction,
  logoutAction,
  refreshAction,
  registerAction,
  startAction,
  accountAction
} from "@/app/components/Header/Search/action"

const actionHandlers = {
  leaderboardAction,
  loginAction,
  registerAction,
  logoutAction,
  bailoutAction,
  startAction,
  analyticsAction,
  refreshAction,
  changeColorTheme,
  accountAction
}

const Search = () => {
  const dispatch = useDispatch()
  const isLoggedIn = useSelector((state) => state.userdata.isLoggedIn)
  const colorId = useSelector((state) => state.colorscheme.id)
  const isOpen = useSelector((state) => state.modal.commandModalOpen)
  const refreshDateTime = useSelector((state) => state.modal.refreshDateTime)

  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const inputRef = useRef(null)
  const wrapperRef = useRef(null)
  const itemRefs = useRef([])

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === colorId) ?? colorSchemeOptions[0],
    [colorId]
  )

  const commands = useMemo(() => {
    return searchData.filter((item) => !item.requiresLogin || isLoggedIn)
  }, [isLoggedIn])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredCommands = useMemo(() => {
    if (!normalizedQuery) return commands

    return commands.filter((item) => {
      const textTargets = [
        item.title ?? item.key,
        item.description,
        ...(item.keywords ?? []),
      ]
        .filter(Boolean)
        .map((v) => v.toLowerCase())

      return textTargets.some((text) => text.includes(normalizedQuery))
    })
  }, [commands, normalizedQuery])

 
  useEffect(() => {
    const el = itemRefs.current[activeIndex]
    if (el) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      })
    }
  }, [activeIndex])

  // Ctrl+Q
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "q") {
        e.preventDefault()
        dispatch(toggleCommandModal())
      }

      if (e.key === "Escape") {
        dispatch(setCommandModalOpen({ value: false }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dispatch])

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  // Outside click
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        dispatch(setCommandModalOpen({ value: false }))
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [dispatch])

  const runCommand = (item) => {
    const handler = actionHandlers[item.action]
    if (!handler) return

    typeof item.val !== "undefined" ? handler(item.val) : handler()

    setQuery("")
    setActiveIndex(0)
    dispatch(setCommandModalOpen({ value: false }))
  }

  const onKeyDown = (event) => {
    if (!filteredCommands.length) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filteredCommands.length)
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1
      )
    }

    if (event.key === "Enter") {
      event.preventDefault()
      runCommand(filteredCommands[activeIndex])
    }

    if (event.key === "Escape") {
      dispatch(setCommandModalOpen({ value: false }))
      setQuery("")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20"
      style={{ backgroundColor: `${activeTheme.bgColor}cc` }}
    >
      <div className="w-full max-w-2xl" ref={wrapperRef}>
        <div
          className="rounded-xl border shadow-2xl overflow-hidden backdrop-blur-md"
          style={{
            backgroundColor: activeTheme.divColor,
            borderColor: activeTheme.divColor2,
          }}
        >

          {/* Input */}
          <div className="relative border-b" style={{ borderColor: activeTheme.divColor2 }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onKeyDown}
              placeholder="Search commands... (Ctrl+Q)"
              className="w-full px-4 py-3 text-sm outline-none"
              style={{
                backgroundColor: activeTheme.divColor,
                color: activeTheme.textColor,
              }}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: activeTheme.textColor2 }}
            >
              Ctrl+Q
            </span>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {filteredCommands.map((item, index) => {
              const isActive = index === activeIndex
              const isThemeItem = item.action === "changeColorTheme"
              const isRefreshItem = item.action === "refreshAction"
              const selectedTheme = isThemeItem && item.val === colorId
              const rightLabel = selectedTheme
                ? "Active"
                : isRefreshItem && refreshDateTime
                  ? `Last updated at ${refreshDateTime}`
                  : null

              return (
                <button
                  key={item.key}
                  ref={(el) => itemRefs.current[index] = el}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runCommand(item)}
                  className="w-full px-4 py-3 text-left transition cursor-pointer flex items-center justify-between"
                  style={{
                    backgroundColor: isActive ? activeTheme.divColor2 : "transparent",
                    transform: isActive ? "scale(1.01)" : "scale(1)",
                    transition: "all 0.15s ease",
                    borderBottom:
                      index !== filteredCommands.length - 1
                        ? `1px solid ${activeTheme.divColor2}`
                        : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    
                    {/* Active Indicator */}
                    <div
                      style={{
                        width: "4px",
                        height: "24px",
                        backgroundColor: isActive ? activeTheme.textColor : "transparent",
                        borderRadius: "2px",
                      }}
                    />

                    <div>
                      <div
                        className="font-medium text-sm capitalize"
                        style={{ color: activeTheme.textColor }}
                      >
                        {item.title ?? item.key}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: activeTheme.textColor2 }}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {rightLabel && (
                    <span
                      className="text-xs"
                      style={{ color: activeTheme.textColor2 }}
                    >
                      {rightLabel}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search