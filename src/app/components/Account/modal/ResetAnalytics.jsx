"use client"

import { resetAccountAnalyticsAction } from "@/app/actions/analyticsAction"
import { useSelector, useDispatch } from "react-redux"
import { resetAnalytics } from "@/app/state/slices/userdataSlice"
import { useMemo, useState } from "react"
import { performLogout } from "@/app/utils/logoutUtil"
import { useRouter } from "next/navigation"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"

const ResetAnalytics = () => {

  const [error, setError] = useState({
    status: false,
    message: ""
  })

  const [successMessage, setSuccessMessage] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [text, setText] = useState("")

  const router = useRouter()
  const dispatch = useDispatch()

  const id = useSelector((state) => state.colorscheme.id)
  const username = useSelector((state) => state.userdata.username)

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  )

  const confirmationPhrase = `reset analytics for account with username ${username}`

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

  const handleReset = async () => {
    try {
      setIsResetting(true)
      setError({ status: false, message: "" })
      setSuccessMessage("")

      if (text !== confirmationPhrase) {
        setError({
          status: true,
          message: "Confirmation phrase does not match"
        })
        setIsResetting(false)
        return
      }

      const access_token = localStorage.getItem("access_token")
      const refresh_token = localStorage.getItem("refresh_token")

      if (!access_token || !refresh_token) {
        setIsResetting(false)
        performLogout()
        router.push("/login")
        return
      }
      const payload={
        access_token : access_token,
        refresh_token : refresh_token
      }
      const response = await resetAccountAnalyticsAction(payload)

      storeNewTokens(response)

      if (response?.success) {
        dispatch(resetAnalytics())
        setText("")
        setSuccessMessage("✔ Analytics reset successfully")
        setIsResetting(false)
        return
      }

      if (!response?.success) {
        if (response?.status === 401 || response?.status === 403) {
          setIsResetting(false)
          performLogout()
          router.push("/login")
          return
        }

        setError({
          status: true,
          message: response?.message || "Failed to reset analytics"
        })
      }

      setIsResetting(false)

    } catch (e) {
      setIsResetting(false)
      setError({
        status: true,
        message: e?.message || "Failed to reset analytics"
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h2
          className="text-xl font-semibold"
          style={{ color: activeTheme.textColor2 }}
        >
          Reset Analytics
        </h2>

        <p className="text-sm opacity-80">
          This clears your account analytics data and cannot be undone.
        </p>

        <ul className="mt-3 text-xs opacity-80 space-y-1 list-disc pl-4">
          <li>Your analytics history will be removed.</li>
          <li>WPM, accuracy, and tests count will be reset.</li>
          <li>This action cannot be reversed.</li>
          <li>You can start fresh after the reset.</li>
        </ul>
      </div>

      <div
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >

        <p className="text-xs opacity-70">
          Type this phrase to confirm
        </p>

        <p
          className="text-sm wrap-break-word"
          style={{ color: activeTheme.textColor2 }}
        >
          {confirmationPhrase}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-md px-3 py-2 border resize-none outline-none"
          style={{
            backgroundColor: activeTheme.divColor,
            borderColor: activeTheme.divColor2,
            color: activeTheme.textColor
          }}
          placeholder="Paste the confirmation phrase exactly"
        />

        {error.status && (
          <p className="text-xs text-red-400">{error.message}</p>
        )}

        {successMessage && (
          <p className="text-xs text-green-400">{successMessage}</p>
        )}

        <div className="flex gap-2 mt-2">

          <button
            onClick={handleReset}
            disabled={isResetting || text !== confirmationPhrase}
            className="px-4 py-1.5 rounded-md text-sm font-medium border transition-opacity"
            style={{
              borderColor: activeTheme.textColor2,
              backgroundColor:
                text === confirmationPhrase
                  ? activeTheme.textColor2
                  : activeTheme.divColor,
              color:
                text === confirmationPhrase
                  ? activeTheme.bgColor
                  : activeTheme.textColor,
              opacity: !isResetting && text === confirmationPhrase ? 1 : 0.6
            }}
          >
            {isResetting ? "Resetting..." : "Reset Analytics"}
          </button>

          <button
            onClick={() => {
              setText("")
              setError({ status: false, message: "" })
              setSuccessMessage("")
            }}
            className="px-4 py-1.5 rounded-md text-sm border"
            style={{ borderColor: activeTheme.divColor2 }}
          >
            Clear
          </button>

        </div>
      </div>
    </div>
  )
}

export default ResetAnalytics   