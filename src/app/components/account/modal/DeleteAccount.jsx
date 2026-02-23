"use client"

import { useMemo, useState } from "react"
import { performLogout } from "@/app/utils/logoutUtil"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { deleteAccountAction } from "@/app/actions/userAction"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"

const DeleteAccount = () => {
  const router = useRouter()

  const id = useSelector((state) => state.colorscheme.id)
  const { username, firstName, lastName } = useSelector((state) => state.userdata)

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  )

  const [error, setError] = useState({ status: false, message: "" })
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const [data, setData] = useState({
    text: "",
    password: "",
    confirmPassword: ""
  })

  const confirmationPhrase = `delete account with username ${username}`

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError({ status: false, message: "" })

      if (data.text !== confirmationPhrase) {
        setError({ status: true, message: "Confirmation phrase does not match" })
        return setIsDeleting(false)
      }

      if (!data.password || !data.confirmPassword) {
        setError({ status: true, message: "Password fields are required" })
        return setIsDeleting(false)
      }

      if (data.password !== data.confirmPassword) {
        setError({ status: true, message: "Passwords do not match" })
        return setIsDeleting(false)
      }

      const access_token = localStorage.getItem("access_token")
      const refresh_token = localStorage.getItem("refresh_token")

      if (!access_token || !refresh_token) {
        performLogout()
        router.push("/login")
        return setIsDeleting(false)
      }

      const payload = {
        password: data.password,
        confirmPassword: data.confirmPassword,
        access_token,
        refresh_token
      }

      const response = await deleteAccountAction(payload)

      storeNewTokens(response)

      if (response?.success) {
        performLogout()
        router.push("/login")
        return setIsDeleting(false)
      }

      if (response?.status === 401 || response?.status === 403) {
        performLogout()
        router.push("/login")
        return setIsDeleting(false)
      }

      setError({
        status: true,
        message: response?.message || "Failed to delete account"
      })

      setIsDeleting(false)

    } catch (e) {
      setError({
        status: true,
        message: e?.message || "Failed to delete account"
      })
      setIsDeleting(false)
    }
  }

  const isFormReady =
    data.text === confirmationPhrase &&
    data.password.length > 0 &&
    data.confirmPassword.length > 0

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h2 className="text-xl font-semibold" style={{ color: activeTheme.textColor2 }}>
          Delete Account
        </h2>

        <p className="text-sm opacity-80">
          This permanently deletes your account and all related data.
        </p>

        <ul className="mt-3 text-xs opacity-80 space-y-1 list-disc pl-4">
          <li>Your data will be deleted and cannot be recovered.</li>
          <li>All analytics and history will be removed.</li>
          <li>This action is permanent.</li>
        </ul>

        <p className="mt-3 text-xs opacity-80">
          Forgot your password?{" "}
          <Link href="/resetpassword" className="underline" style={{ color: activeTheme.textColor2 }}>
            Reset here
          </Link>
        </p>
      </div>

      <div
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >

        <p className="text-xs opacity-70">Account</p>
        <p className="font-medium" style={{ color: activeTheme.textColor2 }}>
          {firstName} {lastName} @{username}
        </p>

        <p className="text-xs opacity-70 mt-1">Type this phrase to confirm</p>
        <p className="text-sm" style={{ color: activeTheme.textColor2 }}>
          {confirmationPhrase}
        </p>

        <textarea
          value={data.text}
          onChange={(e) => setData(prev => ({ ...prev, text: e.target.value }))}
          rows={3}
          className="w-full rounded-md px-3 py-2 border resize-none outline-none"
          style={{
            backgroundColor: activeTheme.divColor,
            borderColor: activeTheme.divColor2,
            color: activeTheme.textColor
          }}
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={data.password}
            onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-md px-3 py-2 pr-10 border outline-none"
            style={{
              backgroundColor: activeTheme.divColor,
              borderColor: activeTheme.divColor2,
              color: activeTheme.textColor
            }}
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={data.confirmPassword}
            onChange={(e) => setData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full rounded-md px-3 py-2 pr-10 border outline-none"
            style={{
              backgroundColor: activeTheme.divColor,
              borderColor: activeTheme.divColor2,
              color: activeTheme.textColor
            }}
            placeholder="Confirm password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {error.status && (
          <p className="text-xs text-red-400">{error.message}</p>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting || !isFormReady}
            className="px-4 py-1.5 rounded-md text-sm font-medium border"
            style={{
              borderColor: activeTheme.textColor2,
              backgroundColor: isFormReady ? activeTheme.textColor2 : activeTheme.divColor,
              color: isFormReady ? activeTheme.bgColor : activeTheme.textColor
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>

          <button
            onClick={() => {
              setData({ text: "", password: "", confirmPassword: "" })
              setError({ status: false, message: "" })
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

export default DeleteAccount