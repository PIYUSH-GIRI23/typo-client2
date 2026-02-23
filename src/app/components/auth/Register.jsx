"use client"

import React, { useState } from "react"
import { useRouter , useSearchParams} from "next/navigation"
import { registerAction } from "@/app/actions/authAction"
import LoadingSpinner from "@/app/components/LoadingSpinner"
import {useSelector, useDispatch} from 'react-redux'
import {login} from '@/app/state/slices/userdataSlice'
import Link from "next/link"
const Register = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()

  const [payload, setPayload] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({
    status: false,
    message: "",
  })

  const handleSubmit = async () => {
    setError({
      status: false,
      message: "",
    })
    
    if(!payload.email || !payload.username || !payload.firstName || !payload.lastName || !payload.password || !payload.confirmPassword) {
      setError({
        status: true,
        message: "Please fill in all fields",
      })
      return
    }

    if(payload.password !== payload.confirmPassword) {
      setError({
        status: true,
        message: "Passwords do not match",
      })
      return
    }
    
    setLoading(true)
    const res = await registerAction(payload);
    
    if (!res.success) {
      setError({
        status: true,
        message: res.message || "Registration failed"
      })
      setLoading(false)
      return
    }
    
    const {tokens,user} = res.data
    if(tokens.accessToken) localStorage.setItem("access_token", tokens.accessToken)
    if(tokens.refreshToken) localStorage.setItem("refresh_token", tokens.refreshToken)
    dispatch(login({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLogin: user.lastLogin,
        dateOfJoining: user.dateOfJoining,
        wpm: user.wpm,
        accuracy: user.accuracy,
        testTimings: user.testTimings,
        lastTestTaken: user.lastTestTaken,
        totalPar: user.totalPar,
        maxStreak: user.maxStreak,
        progress: user.progress
      }))
      setPayload({
        email: "",
        username: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        rememberMe: false,
      })

    const nextPath = searchParams.get("next") || "/"
    router.push(nextPath)
    setLoading(false)
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
        <h1 className="mb-1 text-2xl font-semibold text-center">Create account</h1>
        <p className="mb-6 text-sm text-zinc-500 text-center">
          Sign up to get started
        </p>

        {error.status && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error.message}
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <input
            autoFocus
            type="text"
            placeholder="First name"
            value={payload.firstName}
            onChange={(e) =>
              setPayload({ ...payload, firstName: e.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            disabled={loading}
          />

          <input
            type="text"
            placeholder="Last name"
            value={payload.lastName}
            onChange={(e) =>
              setPayload({ ...payload, lastName: e.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={payload.username}
            onChange={(e) =>
              setPayload({ ...payload, username: e.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email address"
            value={payload.email}
            onChange={(e) =>
              setPayload({ ...payload, email: e.target.value })
            }
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={payload.password}
              onChange={(e) =>
                setPayload({ ...payload, password: e.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-sm outline-none focus:border-zinc-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={payload.confirmPassword}
              onChange={(e) =>
                setPayload({ ...payload, confirmPassword: e.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-sm outline-none focus:border-zinc-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <label className="mb-6 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={payload.rememberMe}
            onChange={(e) =>
              setPayload({ ...payload, rememberMe: e.target.checked })
            }
            className="h-4 w-4 accent-black"
            disabled={loading}
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full rounded-lg py-2 text-sm font-medium transition cursor-pointer
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}
            bg-black text-white`}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <span
            onClick={() => !loading && router.push("/login")}
            className="cursor-pointer font-medium text-zinc-800 hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
    </>
  )
}

export default Register
