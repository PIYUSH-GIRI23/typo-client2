"use client"

import { useSelector, useDispatch } from 'react-redux'
import { fetchUsernameAction } from "@/app/actions/redisAction"
import { checkUsernameAvailabilityAction, updateUsernameAction } from "@/app/actions/userAction"
import { updateUsername } from "@/app/state/slices/userdataSlice"
import { performLogout } from "@/app/utils/logoutUtil"
import colorSchemeOptions from '@/app/state/colorSchemeOptions'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const UpdateUsername = () => {

  const username = useSelector((state) => state.userdata.username)
  const id = useSelector((state) => state.colorscheme.id)
  const dispatch = useDispatch()
  const router = useRouter()

  const [newUsername, setNewUsername] = useState(() => username || "")
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [error, setError] = useState({ status: false, message: "" })
  const [successMessage, setSuccessMessage] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

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

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  )

  // Availability check
  useEffect(() => {
    const candidate = newUsername.trim()

    const timeout = setTimeout(async () => {

      if (!candidate) {
        setUsernameAvailable(false)
        setError({ status: true, message: "Username cannot be empty" })
        return
      }

      if (candidate === username) {
        setUsernameAvailable(null)
        setError({ status: false, message: "" })
        return
      }

      try {
        setCheckingUsername(true)
        setError({ status: false, message: "" })
        setSuccessMessage("")

        const redisCheck = await fetchUsernameAction({ key: candidate })
        if (redisCheck?.success && redisCheck?.available === false) {
          setUsernameAvailable(false)
          setError({ status: true, message: "✖ Username is already taken" })
          setCheckingUsername(false)
          return
        }
        
        const dbCheck = await checkUsernameAvailabilityAction({ username: candidate })
        
        if (!dbCheck?.success || !dbCheck?.available) {
          setUsernameAvailable(false)
          setError({
            status: true,
            message: dbCheck?.message || "✖ Username is already taken"
          })
          setCheckingUsername(false)
          return
        }
        
        setUsernameAvailable(true)
        setError({ status: false, message: "" })
        setCheckingUsername(false)

      } catch (e) {
        setUsernameAvailable(false)
        setError({
          status: true,
          message: e?.message || "Failed to check username availability"
        })
        setCheckingUsername(false)
      }

    }, 450)

    return () => clearTimeout(timeout)

  }, [newUsername, username])

  const updateUsernameHandler = async () => {

    const candidate = newUsername.trim()

    if (!candidate) {
      setError({ status: true, message: "Username cannot be empty" })
      return
    }

    if (candidate === username) return
    if (checkingUsername || usernameAvailable !== true) return

    setIsUpdating(true)
    setError({ status: false, message: "" })
    setSuccessMessage("")

    const access_token = localStorage.getItem("access_token")
    const refresh_token = localStorage.getItem("refresh_token")

    if (!access_token || !refresh_token) {
      setIsUpdating(false)
      performLogout()
      router.push("/login")
      return
    }

    const response = await updateUsernameAction({
      newUsername: candidate,
      access_token,
      refresh_token
    })

    storeNewTokens(response)

    if (response?.status === 401 || response?.status === 403) {
      setIsUpdating(false)
      performLogout()
      router.push("/login")
      return
    }

    if (!response?.success) {
      setIsUpdating(false)
      setError({
        status: true,
        message: response?.message || "Failed to update username"
      })
      return
    }

    const updatedUsername = response?.data?.username || candidate
    dispatch(updateUsername({ username: updatedUsername }))

    setIsUpdating(false)
    setUsernameAvailable(null)
    setSuccessMessage("✔ Username updated successfully")
  }

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h2
          className="text-xl font-semibold"
          style={{ color: activeTheme.textColor2 }}
        >
          Update Username
        </h2>
        <p className="text-sm opacity-80">
          Choose a new unique username
        </p>
      </div>

      <div
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-xs opacity-70">Current Username</p>
        <p className="font-medium" style={{ color: activeTheme.textColor2 }}>
          @{username || "user"}
        </p>

        <textarea
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          rows={2}
          className="w-full rounded-md px-3 py-2 border resize-none outline-none"
          style={{
            backgroundColor: activeTheme.divColor,
            borderColor: activeTheme.divColor2,
            color: activeTheme.textColor
          }}
          placeholder="Enter new username"
        />

        <div className="text-xs opacity-80">
          <p className="mb-1">Username rules:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Use only letters, numbers, and underscore (_).</li>
            <li>Do not start with a number.</li>
            <li>Do not include @ at the beginning.</li>
          </ul>
        </div>

        {checkingUsername && (
          <p className="text-xs opacity-70">Checking availability...</p>
        )}

        {error.status && (
          <p className="text-xs text-red-400">{error.message}</p>
        )}

        {usernameAvailable === true && !checkingUsername && (
          <p className="text-xs text-green-400">✔ Username available</p>
        )}

        {successMessage && (
          <p className="text-xs text-green-400">{successMessage}</p>
        )}

        <div className="flex gap-2 mt-2">

          <button
            onClick={updateUsernameHandler}
            disabled={
              isUpdating ||
              checkingUsername ||
              usernameAvailable !== true
            }
            className="px-4 py-1.5 rounded-md text-sm font-medium border transition-opacity"
            style={{
              borderColor: activeTheme.textColor2,
              backgroundColor:
                usernameAvailable === true
                  ? activeTheme.textColor2
                  : activeTheme.divColor,
              color:
                usernameAvailable === true
                  ? activeTheme.bgColor
                  : activeTheme.textColor,
              opacity:
                usernameAvailable === true && !isUpdating ? 1 : 0.6
            }}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>

          <button
            onClick={() => {
              setNewUsername(username || "")
              setUsernameAvailable(null)
              setError({ status: false, message: "" })
              setSuccessMessage("")
            }}
            className="px-4 py-1.5 rounded-md text-sm border"
            style={{ borderColor: activeTheme.divColor2 }}
          >
            Reset
          </button>

        </div>
      </div>
    </div>
  )
}

export default UpdateUsername