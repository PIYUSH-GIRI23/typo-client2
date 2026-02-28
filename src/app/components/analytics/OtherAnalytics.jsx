"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { getAccountAnalyticsAction } from "@/app/actions/analyticsAction"
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import { performLogout } from "@/app/utils/logoutUtil"
import getAnalyticsInsights from "@/app/components/analytics/insights"

const toNumber = (value) => Number(value) || 0
const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0))

const extractAnalyticsPayload = (response) => {
	if (!response?.success) return null
	return response?.data?.data || response?.data || null
}

const OtherAnalytics = ({ username }) => {
	const isClient = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false
	)

	const router = useRouter()

	const id = useSelector((state) => state.colorscheme.id)
	const { isLoggedIn, username: ownUsername } = useSelector((state) => state.userdata)

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [analytics, setAnalytics] = useState(null)
	const [refreshKey, setRefreshKey] = useState(0)

	const activeTheme = useMemo(
		() => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
		[id]
	)

	const normalizedUsername = useMemo(() => {
		const value = typeof username === "string" ? username : ""
		return decodeURIComponent(value).trim()
	}, [username])

	const isSameUser = useMemo(
		() =>
			Boolean(
				isLoggedIn &&
					ownUsername &&
					normalizedUsername &&
					ownUsername.toLowerCase() === normalizedUsername.toLowerCase()
			),
		[isLoggedIn, normalizedUsername, ownUsername]
	)

	const compositeScore = useMemo(() => {
		if (!analytics) return 0
		return Number(((analytics.wpm * analytics.accuracy) / 100).toFixed(2))
	}, [analytics])

	const metricBars = useMemo(() => {
		if (!analytics) return []

		const speedPercent = clampPercent((analytics.wpm / 120) * 100)
		const accuracyPercent = clampPercent(analytics.accuracy)
		const practicePercent = clampPercent((analytics.totalPar / 150) * 100)

		return [
			{ label: "Speed", valueLabel: `${analytics.wpm} WPM`, percent: speedPercent },
			{ label: "Accuracy", valueLabel: `${analytics.accuracy}%`, percent: accuracyPercent },
			{ label: "Practice Volume", valueLabel: `${analytics.totalPar} Tests`, percent: practicePercent }
		]
	}, [analytics])

	const insights = useMemo(() => {
		return getAnalyticsInsights(analytics)
	}, [analytics])

	useEffect(() => {
		let mounted = true

		const fetchAnalytics = async () => {
			setLoading(true)
			setError("")

			if (!normalizedUsername) {
				if (mounted) {
					setAnalytics(null)
					setError("Invalid username")
					setLoading(false)
				}
				return
			}

			const access_token = localStorage.getItem("access_token")
			const refresh_token = localStorage.getItem("refresh_token")

			if (!access_token || !refresh_token) {
				if (mounted) {
					setAnalytics(null)
					setError("Login required to view profile analytics")
					setLoading(false)
				}
				return
			}

			try {
				const response = await getAccountAnalyticsAction({
					username: normalizedUsername,
					access_token,
					refresh_token
				})

				const nextAccessToken = response?.newTokens?.accessToken
				const nextRefreshToken = response?.newTokens?.refreshToken
				if (nextAccessToken) localStorage.setItem("access_token", nextAccessToken)
				if (nextRefreshToken) localStorage.setItem("refresh_token", nextRefreshToken)

				if (response?.status === 401 || response?.status === 403) {
					performLogout()
					if (mounted) {
						setAnalytics(null)
						setError("Session expired. Please login again.")
						setLoading(false)
					}
					router.push(`/login?next=/analytics/${encodeURIComponent(normalizedUsername)}`)
					return
				}

				const payload = extractAnalyticsPayload(response)

				if (!payload || !payload.username) {
					if (mounted) {
						setAnalytics(null)
						setError(response?.message || "Analytics not found")
						setLoading(false)
					}
					return
				}

				if (mounted) {
					setAnalytics({
						username: payload.username,
						firstName: payload.firstName || "",
						lastName: payload.lastName || "",
						wpm: toNumber(payload.wpm),
						accuracy: toNumber(payload.accuracy),
						totalPar: toNumber(payload.totalPar)
					})
					setLoading(false)
				}
			} catch (fetchError) {
				if (mounted) {
					setAnalytics(null)
					setError(fetchError?.message || "Failed to fetch analytics")
					setLoading(false)
				}
			}
		}

		if (isClient) {
			fetchAnalytics()
		}

		return () => {
			mounted = false
		}
	}, [isClient, normalizedUsername, refreshKey, router])

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
					className="rounded-xl p-4 sm:p-5"
				>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: activeTheme.textColor2 }}>
								Profile Analytics
							</h1>
							<p className="mt-1 text-sm opacity-80">@{normalizedUsername || "unknown"}</p>
						</div>
					</div>

					{loading && (
						<div
							className="mt-4 rounded-lg border p-4"
							style={{
								borderColor: activeTheme.divColor2,
								backgroundColor: activeTheme.bgColor
							}}
						>
							<p className="text-sm animate-pulse">Fetching analytics...</p>
						</div>
					)}

					{!loading && error && (
						<div
							className="mt-4 rounded-lg border p-4"
							style={{
								borderColor: activeTheme.divColor2,
								backgroundColor: activeTheme.bgColor
							}}
						>
							<p className="text-sm font-semibold" style={{ color: activeTheme.textColor2 }}>
								Could not load profile analytics
							</p>
							<p className="mt-1 text-sm opacity-80">{error}</p>

							<div className="mt-3 flex flex-wrap gap-2">
								<ActionButton
									label="Retry"
									onClick={() => setRefreshKey((value) => value + 1)}
									theme={activeTheme}
								/>
								{!isLoggedIn && (
									<ActionButton
										label="Login"
										onClick={() => router.push(`/login?next=/analytics/${encodeURIComponent(normalizedUsername)}`)}
										theme={activeTheme}
										primary
									/>
								)}
							</div>
						</div>
					)}

					{!loading && !error && analytics && (
						<div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
							<div className="flex flex-col gap-4">
								<div
									className="rounded-lg border p-4 sm:p-5"
									style={{
										borderColor: activeTheme.divColor2,
										backgroundColor: activeTheme.bgColor
									}}
								>
									<p className="text-sm opacity-75">Name</p>
									<p className="text-2xl font-semibold mt-0.5" style={{ color: activeTheme.textColor2 }}>
										{analytics.firstName || analytics.lastName
											? `${analytics.firstName} ${analytics.lastName}`.trim()
											: "N/A"}
									</p>
									<p className="text-xs mt-1 opacity-75">@{analytics.username}</p>

									<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
										<InfoCard
											label="WPM"
											value={`${analytics.wpm}`}
											theme={activeTheme}
											helpText="Words Per Minute: average typing speed measured by words completed per minute."
										/>
										<InfoCard
											label="Accuracy"
											value={`${analytics.accuracy}%`}
											theme={activeTheme}
											helpText="Typing accuracy percentage: how many typed words are correct."
										/>
										<InfoCard
											label="Total Paragraph"
											value={`${analytics.totalPar}`}
											theme={activeTheme}
											helpText="Total completed tests/paragraphs counted in this profile analytics."
										/>
										<InfoCard
											label="Composite Score"
											value={`${compositeScore}`}
											theme={activeTheme}
											helpText="Composite score is derived as WPM × Accuracy ÷ 100."
										/>
									</div>
								</div>

								<div
									className="rounded-lg border p-4 sm:p-5"
									style={{
										borderColor: activeTheme.divColor2,
										backgroundColor: activeTheme.bgColor
									}}
								>
									<p className="text-base font-semibold" style={{ color: activeTheme.textColor2 }}>
										Performance Breakdown
									</p>
									<div className="mt-4 flex flex-col gap-3">
										{metricBars.map((metric) => (
											<MetricBar
												key={metric.label}
												label={metric.label}
												valueLabel={metric.valueLabel}
												percent={metric.percent}
												theme={activeTheme}
											/>
										))}
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-4">
								<div
									className="rounded-lg border p-4"
									style={{
										borderColor: activeTheme.divColor2,
										backgroundColor: activeTheme.bgColor
									}}
								>
									<p className="text-sm font-semibold" style={{ color: activeTheme.textColor2 }}>
										Quick Actions
									</p>
									<div className="mt-3 flex flex-col gap-2">
										<ActionButton
											label="Start Typing"
											onClick={() => router.push("/")}
											theme={activeTheme}
											primary
										/>
										<ActionButton
											label="Leaderboard"
											onClick={() => router.push("/leaderboard")}
											theme={activeTheme}
										/>
										{isSameUser && (
											<ActionButton
												label="View Full Analytics"
												onClick={() => router.push("/analytics")}
												theme={activeTheme}
											/>
										)}
										<ActionButton
											label="Open Account"
											onClick={() => router.push("/account")}
											theme={activeTheme}
										/>
										<ActionButton
											label="Retry Fetch"
											onClick={() => setRefreshKey((value) => value + 1)}
											theme={activeTheme}
										/>
									</div>
								</div>

								<div
									className="rounded-lg border p-4"
									style={{
										borderColor: activeTheme.divColor2,
										backgroundColor: activeTheme.bgColor
									}}
								>
									<p className="text-base font-semibold" style={{ color: activeTheme.textColor2 }}>
										Insights
									</p>
									<div className="mt-3 grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
										{insights.map((item, index) => (
											<div
												key={`${item}-${index}`}
												className="rounded-md border px-3 py-2 text-sm leading-relaxed"
												style={{
													borderColor: activeTheme.divColor2,
													backgroundColor: activeTheme.divColor
												}}
											>
												{item}
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}

const InfoCard = ({ label, value, theme, helpText }) => (
	<div
		className="rounded-lg border px-3 py-2"
		style={{
			borderColor: theme.divColor2,
			backgroundColor: theme.divColor
		}}
	>
		<p className="text-xs opacity-75 flex items-center gap-1">
			<span>{label}</span>
			{helpText && <HelpMark theme={theme} title={helpText} />}
		</p>
		<p className="text-base font-semibold mt-0.5" style={{ color: theme.textColor2 }}>
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

const MetricBar = ({ label, valueLabel, percent, theme }) => (
	<div>
		<div className="flex items-center justify-between text-sm">
			<p className="opacity-85">{label}</p>
			<p style={{ color: theme.textColor2 }} className="font-medium">
				{valueLabel}
			</p>
		</div>
		<div
			className="mt-1 h-2.5 rounded-full border overflow-hidden"
			style={{ borderColor: theme.divColor2, backgroundColor: theme.divColor }}
		>
			<div
				className="h-full rounded-full transition-all duration-300"
				style={{
					width: `${percent}%`,
					backgroundColor: theme.textColor2
				}}
			/>
		</div>
	</div>
)

const ActionButton = ({ label, onClick, theme, primary = false }) => (
	<button
		onClick={onClick}
		className="rounded-md border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-85"
		style={{
			borderColor: primary ? theme.textColor2 : theme.divColor2,
			backgroundColor: primary ? theme.textColor2 : theme.bgColor,
			color: primary ? theme.bgColor : theme.textColor
		}}
	>
		{label}
	</button>
)

export default OtherAnalytics
