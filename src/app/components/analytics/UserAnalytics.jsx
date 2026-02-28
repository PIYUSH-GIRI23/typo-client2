"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import formatDateTime from "@/app/utils/formatDateTime"
import { setAccountModal } from "@/app/state/slices/modalSlice"

const toDateKey = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, "0")
  const day = String(dateObj.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseDateKey = (dateKey) => {
  if (!dateKey || typeof dateKey !== "string") return null
  const [year, month, day] = dateKey.split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const addDays = (dateObj, days) => {
  const copy = new Date(dateObj)
  copy.setDate(copy.getDate() + days)
  return copy
}

const shortLabel = (dateObj) =>
  dateObj.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short"
  })

const formatTotalTime = (seconds) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const UserAnalytics = () => {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const router = useRouter()
  const dispatch = useDispatch()

  const id = useSelector((state) => state.colorscheme.id)
  const {
    isLoggedIn,
    wpm,
    accuracy,
    testTimings,
    lastTestTaken,
    totalPar,
    maxStreak,
    progress = []
  } = useSelector((state) => state.userdata)

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  )

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?next=/analytics")
    }
  }, [isLoggedIn, router])

  const sortedProgress = useMemo(() => {
    const normalized = (progress || [])
      .filter((item) => item?.date)
      .map((item) => ({
        date: item.date,
        wpm: Number(item.wpm) || 0,
        accuracy: Number(item.accuracy) || 0,
        count: Number(item.count) || 0
      }))

    normalized.sort((a, b) => a.date.localeCompare(b.date))
    return normalized
  }, [progress])

  const progressByDate = useMemo(() => {
    const map = new Map()

    sortedProgress.forEach((entry) => {
      const existing = map.get(entry.date)
      if (!existing) {
        map.set(entry.date, { ...entry })
        return
      }

      map.set(entry.date, {
        date: entry.date,
        wpm: Math.round((existing.wpm + entry.wpm) / 2),
        accuracy: Math.round((existing.accuracy + entry.accuracy) / 2),
        count: existing.count + entry.count
      })
    })

    return map
  }, [sortedProgress])

  const streakDays = useMemo(() => {
    const firstDate = parseDateKey(sortedProgress[0]?.date) || new Date()

    return Array.from({ length: 7 }, (_, index) => {
      const dateObj = addDays(firstDate, index)
      const date = toDateKey(dateObj)
      return {
        date,
        label: shortLabel(dateObj),
        active: progressByDate.has(date)
      }
    })
  }, [progressByDate, sortedProgress])

  const chartProgressData = useMemo(
    () =>
      sortedProgress.map((item) => {
        const dateObj = parseDateKey(item.date)
        return {
          date: item.date,
          label: dateObj ? shortLabel(dateObj) : item.date,
          wpm: item.wpm,
          accuracy: item.accuracy,
          count: item.count,
          score: Number((item.wpm * item.accuracy).toFixed(2))
        }
      }),
    [sortedProgress]
  )

  const goToAccountSettings = () => {
    dispatch(setAccountModal({ value: 4 }))
    router.push("/account")
  }

  const goToResetAnalytics = () => {
    dispatch(setAccountModal({ value: 3 }))
    router.push("/account")
  }

  if (!isClient) return null
  if (!isLoggedIn) return null

  return (
    <section
      className="w-full px-4 py-4 sm:px-6 min-h-[89vh] md:h-[89vh] overflow-y-auto"
      style={{
        backgroundColor: activeTheme.bgColor,
        color: activeTheme.textColor
      }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
          <aside
            className="rounded-xl border p-4 h-fit"
            style={{
              backgroundColor: activeTheme.divColor,
              borderColor: activeTheme.divColor2
            }}
          >
            <h2 className="text-2xl font-semibold" style={{ color: activeTheme.textColor2 }}>
              Your Analytics
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <InfoChip
                label="WPM"
                value={`${wpm || 0}`}
                theme={activeTheme}
                helpText="Your overall average typing speed across saved tests."
              />
              <InfoChip
                label="Accuracy"
                value={`${accuracy || 0}%`}
                theme={activeTheme}
                helpText="Your overall typing accuracy across saved tests."
              />
              <InfoChip
                label="Max Streak"
                value={`${maxStreak || 0}`}
                theme={activeTheme}
                helpText="Highest number of consecutive days with at least one completed test."
              />
              <InfoChip
                label="Total Para"
                value={`${totalPar || 0}`}
                theme={activeTheme}
                helpText="Total completed paragraphs/tests stored in analytics."
              />
              <InfoChip
                label="Total Time"
                value={formatTotalTime(testTimings)}
                theme={activeTheme}
                helpText="Total typing duration summed from all completed tests."
              />
              <InfoChip
                label="Latest Taken"
                value={lastTestTaken ? formatDateTime(lastTestTaken) : "N/A"}
                theme={activeTheme}
                full
                helpText="Date and time of your most recent completed test."
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <ActionButton
                label="Start Paragraph"
                onClick={() => router.push("/")}
                theme={activeTheme}
                primary
              />
              <ActionButton
                label="Reset Streak"
                onClick={goToResetAnalytics}
                theme={activeTheme}
              />
              <ActionButton
                label="Account Settings"
                onClick={goToAccountSettings}
                theme={activeTheme}
              />
              <ActionButton
                label="Leaderboard"
                onClick={() => router.push("/leaderboard")}
                theme={activeTheme}
              />
            </div>
          </aside>

          <div className="grid grid-cols-1 gap-4">
            <Panel
              title="7 Day Streak"
              theme={activeTheme}
              helpText="Shows 7 sequential days starting from your first progress date. Lit means that date exists in progress history."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {streakDays.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-lg border p-2 text-center"
                    style={{
                      borderColor: activeTheme.divColor2,
                      backgroundColor: activeTheme.bgColor
                    }}
                  >
                    <p className="text-xl leading-none">{day.active ? "🔥" : "🧯"}</p>
                    <p className="mt-1 text-xs opacity-80">{day.label}</p>
                    <p className="text-[10px] opacity-65">{day.date}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title="WPM / Accuracy / Score Trend"
              theme={activeTheme}
              helpText="Date-wise trend of WPM, Accuracy, and Score where Score = WPM × Accuracy."
            >
              <ChartFrame>
                <ResponsiveContainer>
                  <LineChart data={chartProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={activeTheme.divColor2} />
                    <XAxis dataKey="date" stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                    <YAxis yAxisId="left" stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke={activeTheme.textColor2} tick={{ fill: activeTheme.textColor2, fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: activeTheme.divColor,
                        borderColor: activeTheme.divColor2,
                        color: activeTheme.textColor
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="wpm" stroke={activeTheme.textColor2} strokeWidth={2} dot={{ r: 2 }} name="WPM" />
                    <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke={activeTheme.textColor} strokeWidth={2} dot={{ r: 2 }} name="Accuracy" />
                    <Line yAxisId="right" type="monotone" dataKey="score" stroke={activeTheme.textColor2} strokeOpacity={0.55} strokeDasharray="6 4" strokeWidth={2} dot={{ r: 2 }} name="Score (WPM×Acc)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartFrame>
            </Panel>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel
            title="Paragraph Count by Date"
            theme={activeTheme}
            helpText="Count of completed paragraphs/tests for each date in your progress history."
          >
            <ChartFrame>
              <ResponsiveContainer>
                <BarChart data={chartProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={activeTheme.divColor2} />
                  <XAxis dataKey="date" stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                  <YAxis stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: activeTheme.divColor,
                      borderColor: activeTheme.divColor2,
                      color: activeTheme.textColor
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill={activeTheme.textColor2} name="Count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </Panel>

          <Panel
            title="WPM vs Count"
            theme={activeTheme}
            helpText="Compares typing speed against number of completed paragraphs by date."
          >
            <ChartFrame>
              <ResponsiveContainer>
                <LineChart data={chartProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={activeTheme.divColor2} />
                  <XAxis dataKey="date" stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                  <YAxis stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: activeTheme.divColor,
                      borderColor: activeTheme.divColor2,
                      color: activeTheme.textColor
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="wpm" stroke={activeTheme.textColor2} strokeWidth={2} name="WPM" />
                  <Line type="monotone" dataKey="count" stroke={activeTheme.textColor} strokeWidth={2} name="Count" />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </Panel>

          <Panel
            title="Accuracy vs Count"
            theme={activeTheme}
            helpText="Compares typing accuracy against number of completed paragraphs by date."
          >
            <ChartFrame>
              <ResponsiveContainer>
                <LineChart data={chartProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={activeTheme.divColor2} />
                  <XAxis dataKey="date" stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                  <YAxis stroke={activeTheme.textColor} tick={{ fill: activeTheme.textColor, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: activeTheme.divColor,
                      borderColor: activeTheme.divColor2,
                      color: activeTheme.textColor
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke={activeTheme.textColor2} strokeWidth={2} name="Accuracy" />
                  <Line type="monotone" dataKey="count" stroke={activeTheme.textColor} strokeWidth={2} name="Count" />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </Panel>
        </div>
      </div>
    </section>
  )
}

const Panel = ({ title, children, theme, helpText }) => (
  <div
    className="rounded-xl border p-4"
    style={{
      backgroundColor: theme.divColor,
      borderColor: theme.divColor2
    }}
  >
    <p className="text-sm font-semibold mb-3 flex items-center gap-1" style={{ color: theme.textColor2 }}>
      <span>{title}</span>
      {helpText && <HelpMark theme={theme} title={helpText} />}
    </p>
    {children}
  </div>
)

const ChartFrame = ({ children }) => <div className="h-[290px]">{children}</div>

const InfoChip = ({ label, value, theme, full = false, helpText }) => (
  <div
    className={`rounded-lg border px-3 py-2 ${full ? "col-span-2" : ""}`}
    style={{
      borderColor: theme.divColor2,
      backgroundColor: theme.bgColor
    }}
  >
    <p className="text-[11px] opacity-75 flex items-center gap-1">
      <span>{label}</span>
      {helpText && <HelpMark theme={theme} title={helpText} />}
    </p>
    <p className="text-sm font-semibold mt-0.5" style={{ color: theme.textColor2 }}>
      {value}
    </p>
  </div>
)

const HelpMark = ({ theme, title }) => (
  <span className="relative inline-flex group">
    <span
      aria-label={title}
      className="inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-semibold cursor-help border"
      style={{
        color: theme.textColor2,
        borderColor: theme.divColor2,
        backgroundColor: theme.bgColor
      }}
      tabIndex={0}
    >
      ?
    </span>
    <span
      className="pointer-events-none absolute left-1/2 bottom-full mb-2 z-50 w-60 -translate-x-1/2 rounded-md border px-2 py-1.5 text-[11px] leading-snug opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      style={{
        backgroundColor: theme.bgColor,
        borderColor: theme.divColor2,
        color: theme.textColor
      }}
    >
      {title}
    </span>
  </span>
)

const ActionButton = ({ label, onClick, theme, primary = false, helpText }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onClick}
      className="w-full rounded-md border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-85"
      style={{
        borderColor: primary ? theme.textColor2 : theme.divColor2,
        backgroundColor: primary ? theme.textColor2 : theme.bgColor,
        color: primary ? theme.bgColor : theme.textColor
      }}
    >
      {label}
    </button>
    {helpText && <HelpMark theme={theme} title={helpText} />}
  </div>
)

export default UserAnalytics
