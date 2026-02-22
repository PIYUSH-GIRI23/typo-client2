"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { sendOTPAction, resetPasswordAction } from "@/app/actions/userAction"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/app/state/slices/userdataSlice"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/app/components/LoadingSpinner"
import Link from "next/link"

const OTP_LENGTH = 6
const OTP_EXPIRY_SECONDS = 120

const ResetPassword = () => {
  const emailFromState = useSelector((state) => state.userdata.email)
  const dispatch = useDispatch()
  const router = useRouter()

  const [data, setData] = useState(() => ({
    email: emailFromState || "",
    password: "",
    confirmPassword: "",
  }))
  const [formState, setFormState] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({
    status: false,
    message: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""))
  const [timer, setTimer] = useState(0)

  const otpRefs = useRef([])
  const intervalRef = useRef(null)

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits])

  const expireOtp = useCallback(() => {
    setFormState(1)
    setOtpDigits(Array(OTP_LENGTH).fill(""))
    setData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }))
    setError({
      status: true,
      message: "OTP expired. Please request a new one.",
    })
  }, [])

  useEffect(() => {
    if (formState !== 2 || timer <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          expireOtp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [formState, timer, expireOtp])

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timer / 60)
    const seconds = String(timer % 60).padStart(2, "0")
    return `${minutes}:${seconds}`
  }, [timer])

  const clearError = () => {
    setError({ status: false, message: "" })
  }

  const sendOTP = async () => {
    clearError()

    if (!data.email) {
      setError({
        status: true,
        message: "Please enter your email",
      })
      return
    }

    setLoading(true)
    const res = await sendOTPAction({ email: data.email })
    setLoading(false)

    if (!res.success) {
      setError({
        status: true,
        message: res.message || "Failed to send OTP",
      })
      return
    }

    setOtpDigits(Array(OTP_LENGTH).fill(""))
    setData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }))
    setTimer(OTP_EXPIRY_SECONDS)
    setFormState(2)
  }

  const handleResetPassword = async () => {
    clearError()

    if (!otpValue || otpValue.length !== OTP_LENGTH || !data.password || !data.confirmPassword) {
      setError({
        status: true,
        message: "Please fill in all fields",
      })
      return
    }

    if (data.password !== data.confirmPassword) {
      setError({
        status: true,
        message: "Passwords do not match",
      })
      return
    }

    setLoading(true)
    const res = await resetPasswordAction({
      email: data.email,
      otp: otpValue,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })
    setLoading(false)

    if (!res.success) {
      setError({
        status: true,
        message: res.message || "Failed to reset password",
      })
      return
    }

    dispatch(logout())
    router.push("/login")
  }

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return

    const next = [...otpDigits]
    next[index] = value.slice(-1)
    setOtpDigits(next)

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH)
      .fill("")
      .map((_, idx) => pasted[idx] || "")
    setOtpDigits(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    otpRefs.current[focusIndex]?.focus()
  }

  return (
    <>
      {loading && <LoadingSpinner />}
      <div className="flex min-h-screen items-center justify-center px-4 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 lg:bg-white">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-black shadow-sm">
          <div className="mb-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-black"
            >
              ← Back to home
            </Link>
          </div>
          <div className="mb-6 flex items-center justify-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="hidden sm:block text-2xl font-bold bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Typo
              </span>
            </Link>
          </div>

          <h1 className="mb-1 text-2xl font-semibold text-center">Reset your password</h1>
          <p className="mb-6 text-sm text-zinc-500 text-center">
            {formState === 1
              ? "Enter your email to receive a one-time code"
              : "Enter the 6-digit OTP and set your new password"}
          </p>

          {error.status && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error.message}
            </div>
          )}

          {formState === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  autoFocus
                  type="email"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && !loading && sendOTP()}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
                  disabled={loading}
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={sendOTP}
                className={`w-full cursor-pointer rounded-lg py-2 text-sm font-medium transition
                  ${loading ? "cursor-not-allowed opacity-60" : "hover:opacity-90"}
                  bg-black text-white`}
              >
                {loading ? "Sending..." : "Continue"}
              </button>

              <p className="text-center text-sm text-zinc-500">
                Remembered your password?{" "}
                <Link href="/login" className="font-medium text-zinc-800 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          )}

          {formState === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">OTP</label>
                <span className="text-xs text-zinc-500">Expires in {formattedTime}</span>
              </div>

              <div className="flex gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    maxLength={1}
                    className="h-12 w-12 rounded-lg border border-zinc-300 text-center text-lg font-semibold outline-none transition focus:border-zinc-500"
                    disabled={loading}
                  />
                ))}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={data.password}
                    onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleResetPassword()}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm outline-none transition focus:border-zinc-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-black"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={data.confirmPassword}
                    onChange={(e) => setData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleResetPassword()}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm outline-none transition focus:border-zinc-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-black"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleResetPassword}
                className={`w-full cursor-pointer rounded-lg py-2 text-sm font-medium transition
                  ${loading ? "cursor-not-allowed opacity-60" : "hover:opacity-90"}
                  bg-black text-white`}
              >
                {loading ? "Updating..." : "Set new password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ResetPassword
