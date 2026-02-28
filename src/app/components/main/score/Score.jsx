"use client"

import { useMemo, useSyncExternalStore } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"
import { backToTyping } from "@/app/state/slices/typingdataSlice"
import { resetScore } from "@/app/state/slices/userscoreSlice"
import { setAccountModal } from "@/app/state/slices/modalSlice"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import formatDateTime from "@/app/utils/formatDateTime"

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const hoursLabel = h === 1 ? "hour" : "hours"
  const minutesLabel = m === 1 ? "minute" : "minutes"
  const secondsLabel = s === 1 ? "second" : "seconds"

  if (h > 0) return `${h} ${hoursLabel}, ${m} ${minutesLabel}, ${s} ${secondsLabel}`
  if (m > 0) return `${m} ${minutesLabel}, ${s} ${secondsLabel}`
  return `${s} ${secondsLabel}`
}

const Score = () => {
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false)
  const dispatch = useDispatch()
  const router = useRouter()

  const id = useSelector((state) => state.colorscheme.id)
  const {
    isLoggedIn,
    totalPar,
    lastTestTaken,
    testTimings,
    wpm: allTimeWpm,
    accuracy: allTimeAccuracy
  } = useSelector((state) => state.userdata)

  const {
    wrongWordsCount,
    correctWordsCount,
    timeTaken,
    decimal_accuracy,
    decimal_rawWpm,
    decimal_netWpm,
    decimal_finalScore,
    wrongWords,
    needsDbSync,
    dbSyncStatus
  } = useSelector((state) => state.userscore)

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  )

  const correctVsWrong = [
    { name: "Correct", value: correctWordsCount },
    { name: "Wrong", value: wrongWordsCount }
  ]

  const netVsRaw = [
    { name: "Net WPM", value: Number(decimal_netWpm.toFixed(2)) },
    { name: "Raw WPM", value: Number(decimal_rawWpm.toFixed(2)) }
  ]

  const comparisonLineData = [
    {
      name: "Current",
      accuracy: Number(decimal_accuracy.toFixed(2)),
      rawVsAllTime: Number(decimal_rawWpm.toFixed(2))
    },
    {
      name: "All Time",
      accuracy: Number(allTimeAccuracy || 0),
      rawVsAllTime: Number(allTimeWpm || 0)
    }
  ]

  const scoreBarData = [
    { name: "Net WPM", value: Number(decimal_netWpm.toFixed(2)) },
    { name: "Raw WPM", value: Number(decimal_rawWpm.toFixed(2)) },
    { name: "Final Score", value: Number(decimal_finalScore.toFixed(2)) },
    { name: "Overall WPM", value: Number(allTimeWpm || 0) }
  ]

  const backToTypingHandler = () => {
    dispatch(resetScore())
    dispatch(backToTyping())
  }

  const resetAnalyticsHandler = () => {
    dispatch(setAccountModal({ value: 3 }))
    if (isLoggedIn) {
      router.push("/account")
      return
    }
    
    router.push("/login?next=account")
  }

  const goToProfile = () => {
    dispatch(setAccountModal({ value: 1 }))
    if (isLoggedIn) {
      router.push("/account")
      return
    }
    
    router.push("/login?next=account")
  }

  const saveStatus = (() => {
    if (!needsDbSync) return null

    if (!isLoggedIn) {
      return {
        title: "Score not saved",
        description: "Login to save this test score to your account.",
        tone: "warning"
      }
    }

    if (dbSyncStatus === "syncing") {
      return {
        title: "Saving score",
        description: "Your score is being synced to the database.",
        tone: "info"
      }
    }

    if (dbSyncStatus === "failed") {
      return {
        title: "Save failed",
        description: "Could not sync score right now. Login again to retry.",
        tone: "danger"
      }
    }

    return {
      title: "Score pending",
      description: "Your score will be synced shortly.",
      tone: "info"
    }
  })()

  if (!isClient) return null

  return (
    <div className="w-full h-full px-4 sm:px-6 py-4 sm:py-5 flex flex-col" style={{ color: activeTheme.textColor }}>
      <div className="w-full h-full min-h-0 grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-4">
        <div className="h-full min-h-0 flex flex-col gap-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: activeTheme.textColor2 }}>
            Test Results
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Time"
              value={formatTime(timeTaken)}
              theme={activeTheme}
              helpText="Time taken in the current test. Calculated from typing start to test end. Display format: seconds, minutes+seconds, or hours+minutes+seconds."
            />
            <StatCard
              label="Accuracy"
              value={`${Math.floor(decimal_accuracy)}%`}
              hoverValue={`${decimal_accuracy.toFixed(2)}%`}
              theme={activeTheme}
              helpText="Typing accuracy for current test. Formula: (correct words / total typed words) x 100."
              interactive
            />
            <StatCard
              label="WPM"
              value={`${Math.floor(decimal_netWpm)} Net / ${Math.floor(decimal_rawWpm)} Raw`}
              hoverValue={`${decimal_netWpm.toFixed(2)} Net / ${decimal_rawWpm.toFixed(2)} Raw`}
              theme={activeTheme}
              helpText="Raw WPM = (total typed words / time in seconds) x 60. Net WPM = (correct words / time in seconds) × 60. Net reflects mistakes; Raw reflects typing speed only."
              compact
              interactive
            />
            <StatCard
              label="Final Score"
              value={`${Math.floor(decimal_finalScore)}`}
              hoverValue={decimal_finalScore.toFixed(2)}
              theme={activeTheme}
              helpText="Final score for current test. Formula: Raw WPM x (Accuracy / 100)."
              interactive
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard
              label="Total Paragraph"
              value={`${totalPar || 0}`}
              theme={activeTheme}
              helpText="Total number of completed tests saved in your analytics history."
            />
            <InfoCard
              label="Last Test Taken"
              value={lastTestTaken ? formatDateTime(lastTestTaken) : "N/A"}
              theme={activeTheme}
            />
            <InfoCard
              label="Total Time Spent"
              value={formatTime(testTimings || 0)}
              theme={activeTheme}
              helpText="Total typing time across all saved tests. Sum of each test duration."
            />
          </div>

          {saveStatus && (
            <div
              className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              style={{
                backgroundColor: activeTheme.divColor,
                borderColor: activeTheme.divColor2,
                color: activeTheme.textColor
              }}
            >
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color:
                      saveStatus.tone === "danger"
                        ? "#f87171"
                        : saveStatus.tone === "warning"
                          ? activeTheme.textColor2
                          : activeTheme.textColor2
                  }}
                >
                  {saveStatus.title}
                </p>
                <p className="text-xs opacity-80">{saveStatus.description}</p>
              </div>

              {!isLoggedIn && (
                <button
                  onClick={() => router.push("/login")}
                  className="cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-85"
                  style={{
                    borderColor: activeTheme.textColor2,
                    backgroundColor: activeTheme.textColor2,
                    color: activeTheme.bgColor
                  }}
                >
                  Login to Save Score
                </button>
              )}
            </div>
          )}

          <div
            className="flex-1 min-h-0 rounded-xl border p-3 flex flex-col"
            style={{ backgroundColor: activeTheme.divColor, borderColor: activeTheme.divColor2 }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: activeTheme.textColor2 }}>
              Typed Words Table
            </p>
            <div className="flex-1 min-h-0 overflow-auto rounded-md border" style={{ borderColor: activeTheme.divColor2 }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: activeTheme.bgColor }}>
                    <th className="text-left px-3 py-2 border-b" style={{ borderColor: activeTheme.divColor2 }}>#</th>
                    <th className="text-left px-3 py-2 border-b" style={{ borderColor: activeTheme.divColor2 }}>Expected</th>
                    <th className="text-left px-3 py-2 border-b" style={{ borderColor: activeTheme.divColor2 }}>Typed</th>
                    <th className="text-left px-3 py-2 border-b" style={{ borderColor: activeTheme.divColor2 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wrongWords?.length ? (
                    wrongWords.map((row, index) => (
                      <tr key={`${row.expected}-${index}`}>
                        <td className="px-3 py-2 border-b" style={{ borderColor: activeTheme.divColor2 }}>{index + 1}</td>
                        <td className="px-3 py-2 border-b" style={{ borderColor: activeTheme.divColor2 }}>{row.expected}</td>
                        <td className="px-3 py-2 border-b" style={{ borderColor: activeTheme.divColor2 }}>{row.typed || "(empty)"}</td>
                        <td
                          className="px-3 py-2 border-b font-medium"
                          style={{
                            borderColor: activeTheme.divColor2,
                            color: row.isCorrect ? activeTheme.textColor2 : "#f87171"
                          }}
                        >
                          {row.isCorrect ? "Correct" : "Wrong"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center opacity-80">
                        No typed words available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionButton label="Restart Test" onClick={backToTypingHandler} theme={activeTheme} primary />
            <ActionButton label="Reset Analytics" onClick={resetAnalyticsHandler} theme={activeTheme} />
            <ActionButton label="Open Analytics" onClick={() => router.push("/analytics")} theme={activeTheme} />
            <ActionButton label="View Profile" onClick={() => goToProfile()} theme={activeTheme} />
          </div>
        </div>

        <div className="h-full min-h-0 grid grid-rows-2 gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
            <PiePanel
              title="Correct vs Wrong Words"
              data={correctVsWrong}
              theme={activeTheme}
              helpText="Shows word-level quality split in current test. More Correct than Wrong means better typing precision."
            />
            <PiePanel
              title="Net vs Raw WPM"
              data={netVsRaw}
              theme={activeTheme}
              helpText="Compares effective speed (Net WPM) vs raw speed (Raw WPM). Bigger gap means more mistakes impacting effective speed."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-0">
            <LinePanel
              title="Current vs All Time Comparison"
              data={comparisonLineData}
              theme={activeTheme}
              helpText="Two trend lines from Current to All Time: Accuracy and Raw-to-All WPM. Upward slope means improvement, downward slope means current test is below long-term average."
            />
            <BarPanel
              title="Net / Raw / Final Score"
              data={scoreBarData}
              theme={activeTheme}
              helpText="Absolute comparison of current Net WPM, current Raw WPM, current Final Score, and overall All-Time WPM."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, hoverValue, theme, interactive = false, compact = false, helpText }) => (
  <div
    className={`group rounded-lg border p-3 transition-all duration-200 ${interactive ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
    style={{ backgroundColor: theme.divColor, borderColor: theme.divColor2 }}
  >
    <p className="text-xs opacity-70 flex items-center gap-1" style={{ color: theme.textColor }}>
      <span>{label}</span>
      {helpText && <HelpMark theme={theme} title={helpText} />}
    </p>
    <div className={`relative mt-1 ${compact ? "min-h-12" : "min-h-10"}`}>
      <p
        className={`font-semibold transition-opacity duration-300 leading-tight wrap-break-word ${compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"} ${interactive ? "opacity-100 group-hover:opacity-0" : "opacity-100"}`}
        style={{ color: theme.textColor2 }}
      >
        {value}
      </p>
      {interactive && (
        <p
          className={`font-semibold absolute top-0 left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 leading-tight wrap-break-word ${compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}
          style={{ color: theme.textColor2 }}
        >
          {hoverValue}
        </p>
      )}
    </div>
  </div>
)

const InfoCard = ({ label, value, theme, helpText }) => (
  <div
    className="rounded-lg border p-3"
    style={{ backgroundColor: theme.divColor, borderColor: theme.divColor2 }}
  >
    <p className="text-xs opacity-70 flex items-center gap-1" style={{ color: theme.textColor }}>
      <span>{label}</span>
      {helpText && <HelpMark theme={theme} title={helpText} />}
    </p>
    <p className="text-base font-medium mt-1" style={{ color: theme.textColor2 }}>{value}</p>
  </div>
)

const PiePanel = ({ title, data, theme, helpText }) => {
  const chartColors = [theme.textColor2, theme.textColor]

  return (
    <div
      className="h-full min-h-0 rounded-xl border p-3 flex flex-col"
      style={{ backgroundColor: theme.divColor, borderColor: theme.divColor2 }}
    >
      <p className="text-sm font-semibold text-center flex items-center justify-center gap-1" style={{ color: theme.textColor2 }}>
        <span>{title}</span>
        {helpText && <HelpMark theme={theme} title={helpText} />}
      </p>
      <p className="text-xs text-center opacity-80 mb-1" style={{ color: theme.textColor }}>
        Hover slices for exact values
      </p>

      <div className="flex-1 min-h-44">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: theme.bgColor,
                borderColor: theme.divColor2,
                borderRadius: "0.75rem"
              }}
              itemStyle={{ color: theme.textColor }}
              labelStyle={{ color: theme.textColor2 }}
              formatter={(value, name) => [value, name]}
              cursor={{ fill: theme.divColor2, fillOpacity: 0.24 }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={chartColors[index % chartColors.length]} className="cursor-pointer" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-center">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5" style={{ color: theme.textColor }}>
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LinePanel = ({ title, data, theme, helpText }) => (
  <div
    className="h-full min-h-0 rounded-xl border p-3 flex flex-col"
    style={{ backgroundColor: theme.divColor, borderColor: theme.divColor2 }}
  >
    <p className="text-sm font-semibold text-center mb-2 flex items-center justify-center gap-1" style={{ color: theme.textColor2 }}>
      <span>{title}</span>
      {helpText && <HelpMark theme={theme} title={helpText} />}
    </p>
    <div className="flex-1 min-h-44">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.divColor2} />
          <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 12 }} axisLine={{ stroke: theme.divColor2 }} tickLine={{ stroke: theme.divColor2 }} />
          <YAxis tick={{ fill: theme.textColor, fontSize: 12 }} axisLine={{ stroke: theme.divColor2 }} tickLine={{ stroke: theme.divColor2 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.bgColor,
              borderColor: theme.divColor2,
              borderRadius: "0.75rem"
            }}
            itemStyle={{ color: theme.textColor }}
            labelStyle={{ color: theme.textColor2 }}
          />
          <Line type="monotone" dataKey="accuracy" name="Curr→All Accuracy" stroke={theme.textColor2} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="rawVsAllTime" name="Curr Raw→All WPM" stroke={theme.textColor} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-1 flex flex-wrap justify-center gap-4 text-xs">
      <div className="flex items-center gap-1.5" style={{ color: theme.textColor }}>
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.textColor2 }} />
        <span>Curr to All Accuracy</span>
      </div>
      <div className="flex items-center gap-1.5" style={{ color: theme.textColor }}>
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.textColor }} />
        <span>Curr Raw to All WPM</span>
      </div>
    </div>
  </div>
)

const BarPanel = ({ title, data, theme, helpText }) => (
  <div
    className="h-full min-h-0 rounded-xl border p-3 flex flex-col"
    style={{ backgroundColor: theme.divColor, borderColor: theme.divColor2 }}
  >
    <p className="text-sm font-semibold text-center mb-2 flex items-center justify-center gap-1" style={{ color: theme.textColor2 }}>
      <span>{title}</span>
      {helpText && <HelpMark theme={theme} title={helpText} />}
    </p>
    <div className="flex-1 min-h-44">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.divColor2} />
          <XAxis dataKey="name" tick={{ fill: theme.textColor, fontSize: 12 }} axisLine={{ stroke: theme.divColor2 }} tickLine={{ stroke: theme.divColor2 }} />
          <YAxis tick={{ fill: theme.textColor, fontSize: 12 }} axisLine={{ stroke: theme.divColor2 }} tickLine={{ stroke: theme.divColor2 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.bgColor,
              borderColor: theme.divColor2,
              borderRadius: "0.75rem"
            }}
            itemStyle={{ color: theme.textColor }}
            labelStyle={{ color: theme.textColor2 }}
            formatter={(value) => [value, "Value"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={theme.textColor2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
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

const ActionButton = ({ label, onClick, theme, primary = false }) => (
  <button
    onClick={onClick}
    className="rounded-lg border px-4 py-2.5 text-sm font-semibold transition-opacity duration-200 hover:opacity-85"
    style={{
      borderColor: primary ? theme.textColor2 : theme.divColor2,
      backgroundColor: primary ? theme.textColor2 : theme.divColor,
      color: primary ? theme.bgColor : theme.textColor2
    }}
  >
    {label}
  </button>
)

export default Score
