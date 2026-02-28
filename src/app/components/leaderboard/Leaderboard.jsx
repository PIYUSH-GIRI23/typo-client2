"use client"

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import { fetchLeaderboardAction } from "@/app/actions/redisAction"
import { backToTyping } from "@/app/state/slices/typingdataSlice"

const normalizeNumber = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return parsed
}

const toFixed2 = (value) => normalizeNumber(value).toFixed(2)

const Leaderboard = () => {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const dispatch = useDispatch()
  const router = useRouter()

  const colorId = useSelector((state) => state.colorscheme.id)
  const { isLoggedIn } = useSelector((state) => state.userdata)

  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === colorId) ?? colorSchemeOptions[0],
    [colorId]
  )

  const fetchLeaderboardRows = useCallback(async () => {
    const response = await fetchLeaderboardAction({ key: "leaderboard" })

    if (!response?.success) {
      return {
        rows: [],
        error: response?.message || "Unable to fetch leaderboard."
      }
    }

    const incoming = Array.isArray(response.data) ? response.data : []

    const normalized = incoming.slice(0, 10).map((item, index) => ({
      rank: normalizeNumber(item?.rank) || index + 1,
      userId: item?.userId || "",
      username: item?.username || "Unknown",
      wpm: normalizeNumber(item?.wpm),
      accuracy: normalizeNumber(item?.accuracy),
      weightedScore: normalizeNumber(item?.weightedScore)
    }))

    return {
      rows: normalized,
      error: ""
    }
  }, [])

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true)
    setError("")

    const result = await fetchLeaderboardRows()

    setRows(result.rows)
    setError(result.error)
    setIsLoading(false)
  }, [fetchLeaderboardRows])

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      const result = await fetchLeaderboardRows()
      if (!isMounted) return

      setRows(result.rows)
      setError(result.error)
      setIsLoading(false)
    }

    bootstrap()

    return () => {
      isMounted = false
    }
  }, [fetchLeaderboardRows])

  if (!isClient) return null

  return (
    <section
      className="w-full px-4 py-4 sm:px-6 min-h-[89vh] md:h-[89vh] overflow-y-auto"
      style={{
        backgroundColor: activeTheme.bgColor,
        color: activeTheme.textColor
      }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className="rounded-xl border p-4 sm:p-5"
          style={{
            backgroundColor: activeTheme.divColor,
            borderColor: activeTheme.divColor2
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: activeTheme.textColor2 }}>
                Leaderboard
              </h1>
              <p className="mt-1 text-sm" style={{ color: activeTheme.textColor }}>
                Top 10 typists based on weighted score.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton
                label={isLoading ? "Fetching..." : "Fetch Again"}
                onClick={loadLeaderboard}
                disabled={isLoading}
                theme={activeTheme}
                primary
              />
              <ActionButton
                label="Start Typing"
                onClick={() => {
                  dispatch(backToTyping())
                  router.push("/")
                }}
                theme={activeTheme}
              />
              <ActionButton
                label="View Analytics"
                onClick={() => {
                  router.push(isLoggedIn ? "/analytics" : "/login?next=/analytics")
                }}
                theme={activeTheme}
              />
              <ActionButton
                label="Account"
                onClick={() => {
                  router.push(isLoggedIn ? "/account" : "/login?next=/account")
                }}
                theme={activeTheme}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm" style={{ color: activeTheme.textColor2 }}>
              {error}
            </p>
          )}

          {!isLoading && !error && rows.length === 0 && (
            <p className="mt-4 text-sm" style={{ color: activeTheme.textColor }}>
              No leaderboard data available.
            </p>
          )}

          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full min-w-175 text-sm border-collapse">
              <thead>
                <tr style={{ color: activeTheme.textColor2 }}>
                  <TableHeadCell theme={activeTheme}>Rank</TableHeadCell>
                  <TableHeadCell theme={activeTheme}>Username</TableHeadCell>
                  <TableHeadCell theme={activeTheme} align="right">WPM</TableHeadCell>
                  <TableHeadCell theme={activeTheme} align="right">Accuracy</TableHeadCell>
                  <TableHeadCell theme={activeTheme} align="right">Weighted Score</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={`${entry.userId}-${entry.rank}`} className="border-t" style={{ borderColor: activeTheme.divColor2 }}>
                    <TableCell theme={activeTheme}>{entry.rank}</TableCell>
                    <TableCell theme={activeTheme}>
                      <button
                        type="button"
                        onClick={() => router.push(`/analytics/${encodeURIComponent(entry.username)}`)}
                        className="cursor-pointer underline-offset-2 hover:underline"
                        style={{ color: activeTheme.textColor2 }}
                      >
                        @{entry.username}
                      </button>
                    </TableCell>
                    <TableCell theme={activeTheme} align="right">{toFixed2(entry.wpm)}</TableCell>
                    <TableCell theme={activeTheme} align="right">{toFixed2(entry.accuracy)}%</TableCell>
                    <TableCell theme={activeTheme} align="right">{toFixed2(entry.weightedScore)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 md:hidden">
            {rows.map((entry) => (
              <article
                key={`${entry.userId}-${entry.rank}-mobile`}
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: activeTheme.bgColor,
                  borderColor: activeTheme.divColor2
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: activeTheme.textColor2 }}>
                    Rank #{entry.rank}
                  </p>
                  <p className="text-sm" style={{ color: activeTheme.textColor }}>
                    {toFixed2(entry.weightedScore)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/analytics/${encodeURIComponent(entry.username)}`)}
                  className="mt-1 text-left text-base font-medium cursor-pointer underline-offset-2 hover:underline"
                  style={{ color: activeTheme.textColor2 }}
                >
                  @{entry.username}
                </button>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <InfoTag label="WPM" value={toFixed2(entry.wpm)} theme={activeTheme} />
                  <InfoTag label="Accuracy" value={`${toFixed2(entry.accuracy)}%`} theme={activeTheme} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const ActionButton = ({ label, onClick, disabled, theme, primary = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rounded-md border px-3 py-2 text-sm cursor-pointer disabled:cursor-not-allowed"
    style={{
      borderColor: theme.divColor2,
      color: primary ? theme.bgColor : theme.textColor,
      backgroundColor: primary ? theme.textColor2 : theme.divColor,
      opacity: disabled ? 0.7 : 1
    }}
  >
    {label}
  </button>
)

const TableHeadCell = ({ children, theme, align = "left" }) => (
  <th
    className="px-3 py-2 font-medium"
    style={{
      textAlign: align,
      borderBottom: `1px solid ${theme.divColor2}`
    }}
  >
    {children}
  </th>
)

const TableCell = ({ children, theme, align = "left" }) => (
  <td className="px-3 py-3" style={{ textAlign: align, color: theme.textColor }}>
    {children}
  </td>
)

const InfoTag = ({ label, value, theme }) => (
  <div
    className="rounded-md border px-2 py-1"
    style={{
      borderColor: theme.divColor2,
      backgroundColor: theme.divColor
    }}
  >
    <p className="text-[11px]" style={{ color: theme.textColor2 }}>
      {label}
    </p>
    <p style={{ color: theme.textColor }}>{value}</p>
  </div>
)

export default Leaderboard
