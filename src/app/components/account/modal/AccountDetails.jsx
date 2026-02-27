"use client"

import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { setAccountModal } from '@/app/state/slices/modalSlice'
import { backToTyping } from '@/app/state/slices/typingdataSlice'
import formatDateTime from "@/app/utils/formatDateTime"
import colorSchemeOptions from '@/app/state/colorSchemeOptions'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

const AccountDetails = () => {
  const { email, username, firstName, lastName, lastLogin, dateOfJoining } = useSelector((state) => state.userdata)
  const id = useSelector((state) => state.colorscheme.id)
  const dispatch = useDispatch()
  const router = useRouter()

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  )

  const linkButtonStyle = {
    borderColor: activeTheme.divColor2,
    backgroundColor: activeTheme.bgColor,
    color: activeTheme.textColor2
  }

  return (
  <div className="flex flex-col gap-6">

    {/* Header */}
    <div>
      <h2
        className="text-xl font-semibold"
        style={{ color: activeTheme.textColor2 }}
      >
        Account Details
      </h2>
      <p className="text-sm opacity-80">
        Manage your profile information
      </p>
    </div>

    {/* Info Grid */}
    <div className="grid sm:grid-cols-2 gap-4">

      {/* Email */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-xs opacity-70">Email</p>
        <p className="font-medium">{email || "N/A"}</p>
      </div>

      {/* First Name */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-xs opacity-70">First Name</p>
        <p className="font-medium">{firstName || "N/A"}</p>
      </div>

      {/* Username */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-xs opacity-70">Username</p>
        <p className="font-medium">@{username || "N/A"}</p>
      </div>

      {/* Last Name */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-xs opacity-70">Last Name</p>
        <p className="font-medium">{lastName || "N/A"}</p>
      </div>

      {/* Last Login */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-xs opacity-70">Last Login</p>
        <p className="font-medium">
          {lastLogin ? formatDateTime(lastLogin) : "N/A"}
        </p>
      </div>

      {/* Created At */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-xs opacity-70">Date of Joining</p>
        <p className="font-medium">
          {dateOfJoining ? formatDateTime(dateOfJoining) : "N/A"}
        </p>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <div
        className="rounded-lg border p-4 flex flex-col gap-2"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-sm font-semibold" style={{ color: activeTheme.textColor2 }}>
          Quick Links
        </p>

        <button
          onClick={() => {
            dispatch(backToTyping());
            router.push("/")
          }}
          className="rounded-md border px-3 py-2 text-sm text-left"
          style={linkButtonStyle}
        >
          Start Test
        </button>

        <button
          onClick={() => dispatch(setAccountModal({ value: 2 }))}
          className="rounded-md border px-3 py-2 text-sm text-left"
          style={linkButtonStyle}
        >
          Update Username
        </button>

        <button
          onClick={() => dispatch(setAccountModal({ value: 3 }))}
          className="rounded-md border px-3 py-2 text-sm text-left"
          style={linkButtonStyle}
        >
          Reset Analytics
        </button>
      </div>

      <div
        className="rounded-lg border p-4 flex flex-col gap-2"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.divColor2
        }}
      >
        <p className="text-sm font-semibold" style={{ color: activeTheme.textColor2 }}>
          Account Setting
        </p>

        <Link
          href="/resetpassword"
          className="rounded-md border px-3 py-2 text-sm"
          style={linkButtonStyle}
        >
          Reset Password
        </Link>

        <button
          onClick={() => dispatch(setAccountModal({ value: 4 }))}
          className="rounded-md border px-3 py-2 text-sm text-left"
          style={linkButtonStyle}
        >
          Delete Account
        </button>
      </div>
    </div>

  </div>

  )
}

export default AccountDetails
