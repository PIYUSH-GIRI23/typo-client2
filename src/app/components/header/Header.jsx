"use client"

import { useSelector } from "react-redux"
import { useMemo, useState, useRef, useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import { performLogout } from "@/app/utils/logoutUtil"

export default function Header() {

    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )

    const colorId = useSelector((state) => state.colorscheme.id)
    const { isLoggedIn, maxStreak, username, firstName, lastName } = useSelector((state) => state.userdata)

    const pathname = usePathname()
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef(null)

    const activeTheme = useMemo(
        () => colorSchemeOptions.find((option) => option.id === colorId) ?? colorSchemeOptions[0],
        [colorId]
    )

    useEffect(() => {
        if (!isClient) return

        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)

    }, [isClient])

    const hiddenRoutes = ['/login', '/register','/resetpassword']
    if (hiddenRoutes.includes(pathname)) return null

    if (!isClient) return null

    return (
        <header
            className="border-b"
            style={{
                backgroundColor: activeTheme.bgColor,
                borderColor: activeTheme.divColor2,
                color: activeTheme.textColor2
            }}
        >
            <div className="mx-auto flex items-center justify-between gap-3 px-4 py-3">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: activeTheme.textColor }}>
                        Typo
                    </span>
                </Link>

                {/* Right Section */}
                <div className="flex items-center gap-4 text-xs sm:text-sm">

                    {/* Streak */}
                    <div className="flex items-center gap-1">
                        <span className="text-xl">🔥</span>
                        <span style={{ color: activeTheme.textColor }}>
                            {maxStreak}
                        </span>
                    </div>

                    <Link
                        href="/leaderboard"
                        className="px-2 py-1 rounded hover:opacity-80"
                        style={{ color: activeTheme.textColor }}
                    >
                        Leaderboard
                    </Link>

                    {!isLoggedIn ? (
                        <>
                            <Link href="/login" style={{ color: activeTheme.textColor }}>Login</Link>
                            <Link href="/register" style={{ color: activeTheme.textColor }}>Register</Link>
                        </>
                    ) : (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(prev => !prev)}
                                className="cursor-pointer px-2 py-1 rounded hover:opacity-80"
                                style={{ color: activeTheme.textColor }}
                            >
                                @{username} ▾
                            </button>

                            {profileOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 flex flex-col min-w-40 rounded-md shadow-lg z-20"
                                    style={{
                                        backgroundColor: activeTheme.divColor,
                                        border: `1px solid ${activeTheme.divColor2}`
                                    }}
                                >
                                    <Link
                                        href={`/account/${username}`}
                                        onClick={() => setProfileOpen(false)}
                                        className="px-3 py-2 hover:opacity-80"
                                        style={{ color: activeTheme.textColor }}
                                    >
                                        Account
                                    </Link>

                                    <Link
                                        href={`/analytics/${username}`}
                                        onClick={() => setProfileOpen(false)}
                                        className="px-3 py-2 hover:opacity-80"
                                        style={{ color: activeTheme.textColor }}
                                    >
                                        Analytics
                                    </Link>

                                    <button
                                        onClick={() => {
                                            performLogout()
                                            setProfileOpen(false)
                                        }}
                                        className="px-3 py-2 text-left hover:opacity-80"
                                        style={{ color: activeTheme.textColor }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}