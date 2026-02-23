"use client"

import { useSelector, useDispatch } from 'react-redux'
import { setAccountModal } from '@/app/state/slices/modalSlice'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import DeleteAccount from '@/app/components/account/modal/DeleteAccount'
import ResetAnalytics from '@/app/components/account/modal/ResetAnalytics'
import AccountDetails from '@/app/components/account/modal/AccountDetails'
import UpdateUsername from '@/app/components/account/modal/UpdateUsername'
import colorSchemeOptions from '@/app/state/colorSchemeOptions'

const Account = () => {

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const router = useRouter()
  const dispatch = useDispatch()

  const accountModal = useSelector((state) => state.modal.accountModal)
  const id = useSelector((state) => state.colorscheme.id)
  const { isLoggedIn, username } = useSelector((state) => state.userdata)

  const [menuOpen, setMenuOpen] = useState(false)

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  )

  const handleModalChange = (val) => {
    dispatch(setAccountModal({ value: val }))
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?next=account")
    }
  }, [isLoggedIn, router])

  const options = [
    { id: 1, label: 'Account Details' },
    { id: 2, label: 'Update Username' },
    { id: 3, label: 'Reset Analytics' },
    { id: 4, label: 'Account Settings' }
  ]

  if (!isClient) return null

  return (
    <section
      className="w-full px-4 py-4 sm:px-6 h-[89vh]"
      style={{
        backgroundColor: activeTheme.bgColor,
        color: activeTheme.textColor
      }}
    >
      <div className="mx-auto w-full max-w-6xl">

        {/* Mobile Header */}
        <div
          className="mb-4 flex items-center justify-between rounded-xl border px-4 py-3 md:hidden "
          style={{
            backgroundColor: activeTheme.divColor,
            borderColor: activeTheme.divColor2
          }}
        >
          <p
            className="truncate text-sm font-semibold"
            style={{ color: activeTheme.textColor2 }}
          >
            @{username || 'user'}
          </p>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-md border px-3 py-1.5 text-sm"
            style={{
              borderColor: activeTheme.divColor2,
              color: activeTheme.textColor2,
              backgroundColor: activeTheme.bgColor
            }}
          >
            ☰ Options
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">

          {/* Sidebar */}
          <aside
            className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col rounded-xl border p-3`}
            style={{
              backgroundColor: activeTheme.divColor,
              borderColor: activeTheme.divColor2
            }}
          >
            <div
              className="mb-3 hidden border-b pb-3 md:block"
              style={{ borderColor: activeTheme.divColor2 }}
            >
              <p className="text-xs uppercase tracking-wide opacity-80">
                Account
              </p>

              <p
                className="mt-1 truncate text-lg font-semibold"
                style={{ color: activeTheme.textColor2 }}
              >
                @{username || 'user'}
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {options.map((option) => {
                const isActive = accountModal === option.id

                return (
                  <button
                    key={option.id}
                    onClick={() => handleModalChange(option.id)}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-opacity hover:opacity-85"
                    style={{
                      borderColor: isActive ? activeTheme.textColor2 : activeTheme.divColor2,
                      backgroundColor: isActive ? activeTheme.bgColor : activeTheme.divColor,
                      color: isActive ? activeTheme.textColor2 : activeTheme.textColor
                    }}
                  >
                    <span className="text-sm font-medium">
                      {option.label}
                    </span>

                    {isActive && (
                      <span className="inline-flex items-center">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: activeTheme.textColor2 }}
                        />
                        <span
                          className="h-0 w-0 border-y-[5px] border-l-8 border-y-transparent"
                          style={{ borderLeftColor: activeTheme.textColor2 }}
                        />
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div
            className="rounded-xl border p-4 sm:p-5 h-[80vh]"
            style={{
              backgroundColor: activeTheme.divColor,
              borderColor: activeTheme.divColor2
            }}
          >
            {accountModal === 1 && <AccountDetails />}
            {accountModal === 2 && <UpdateUsername />}
            {accountModal === 3 && <ResetAnalytics />}
            {accountModal === 4 && <DeleteAccount />}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Account