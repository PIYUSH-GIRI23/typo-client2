"use client"

import React, { useState } from "react"
import { useRouter , useSearchParams} from "next/navigation"
import { loginAction } from "@/app/actions/authAction"
import LoadingSpinner from "./LoadingSpinner"
import {useSelector, useDispatch} from 'react-redux'
import {login} from '@/app/state/slices/userdataSlice'
import {setRefreshDate} from '@/app/state/slices/modalSlice' 
import Link from "next/link"
const Login = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const searchParams = useSearchParams()

  const [payload, setPayload] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState({
    status: false,
    message: "",
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError({
      status: false,
      message: "",
    })
    
    if(!payload.identifier || !payload.password) {
      setError({
        status: true,
        message: "Please fill in all fields",
      })
      return
    }

    setLoading(true)
    const res = await loginAction(payload)
   
    if (!res.success) {
      setError({
        status: true,
        message: res.message || "Login failed"
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
    }))
    dispatch(setRefreshDate({
      newDate: Date.now()
    }))

    setPayload({
      identifier: "",
      password: "",
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
          <div className="mb-6 flex items-center justify-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              
              <span className="hidden sm:block text-2xl font-bold bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Typo
              </span>
            </Link>  
          </div>
          <h1 className="mb-1 text-2xl font-semibold text-center">Welcome back</h1>
          <p className="mb-6 text-sm text-zinc-500 text-center">
            Login to your account
          </p>

          {error.status && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error.message}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Email or Username
            </label>
            <input
              autoFocus
              type="text"
              placeholder="you@example.com"
              value={payload.identifier}
              onChange={(e) =>
                setPayload({ ...payload, identifier: e.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={payload.password}
                onChange={(e) =>
                  setPayload({ ...payload, password: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm outline-none transition focus:border-zinc-500"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-black"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
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
              className="cursor-pointer text-sm text-zinc-500 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className={`w-full cursor-pointer rounded-lg py-2 text-sm font-medium transition
              ${loading
                ? "cursor-not-allowed opacity-60"
                : "hover:opacity-90"
              }
              bg-black text-white`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-4 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <span
              onClick={() => !loading && router.push("/register")}
              className="cursor-pointer font-medium text-zinc-800 hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login
