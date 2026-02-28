const toNumber = (value) => {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

const getAccuracyInsight = (accuracy) => {
	if (accuracy >= 99) return "Elite precision. Maintain this by mixing long and short paragraphs to preserve control under fatigue."
	if (accuracy >= 97) return "Near-perfect accuracy. Push speed gradually in 5 WPM steps while preserving this quality bar."
	if (accuracy >= 95) return "Excellent accuracy consistency. Increase tempo slightly and monitor whether errors rise late in the test."
	if (accuracy >= 92) return "Strong accuracy baseline. Focus on punctuation and capital transitions to close the final gap."
	if (accuracy >= 88) return "Good control overall. Reduce burst mistakes by easing into the first 10 seconds of each run."
	if (accuracy >= 84) return "Moderate precision. Prioritize clean rhythm before aggressive speed pushes."
	if (accuracy >= 78) return "Error rate is impacting score. Use deliberate practice with shorter sessions and strict correction."
	return "Accuracy is currently the primary bottleneck. Slow down and rebuild finger-to-key consistency first."
}

const getSpeedInsight = (wpm) => {
	if (wpm >= 120) return "Top-tier speed profile. Continue interval blocks and recovery pacing to sustain performance."
	if (wpm >= 100) return "Very high speed. Add endurance sets to keep output stable across longer passages."
	if (wpm >= 85) return "High speed zone. Fine-tune consistency by reducing sudden acceleration spikes."
	if (wpm >= 70) return "Strong speed base. Daily mixed-difficulty drills can move you into advanced range."
	if (wpm >= 55) return "Solid mid-speed performance. Combine cadence drills with accuracy-first repetitions."
	if (wpm >= 40) return "Developing speed. Short sprint sessions with controlled rest can raise ceiling quickly."
	if (wpm >= 28) return "Early growth phase. Build stable rhythm and home-row confidence before forcing pace."
	return "Foundational speed stage. Focus on posture, key familiarity, and smooth keystroke flow."
}

const getPracticeInsight = (totalPar) => {
	if (totalPar >= 500) return "Very large practice sample. Metrics are highly stable and trend signals are reliable."
	if (totalPar >= 300) return "Extensive practice history. Use targeted weak-area sessions to unlock incremental gains."
	if (totalPar >= 180) return "Strong sample size. You can trust trend direction and optimize training blocks."
	if (totalPar >= 100) return "Good practice volume. Continue consistency to improve week-over-week reliability."
	if (totalPar >= 60) return "Moderate dataset. Progress is visible, and more repetition will sharpen signal quality."
	if (totalPar >= 25) return "Early dataset. Keep frequent sessions so analytics become more representative."
	if (totalPar >= 10) return "Limited sample size. Interpret swings cautiously until more tests are completed."
	return "Very small sample. Complete more tests for meaningful trend confidence."
}

const getBalanceInsight = ({ wpm, accuracy, compositeScore, totalPar }) => {
	if (totalPar < 10) {
		return "Baseline phase: prioritize consistency over optimization until enough tests are recorded."
	}

	if (wpm >= 85 && accuracy >= 95) {
		return "Excellent speed-accuracy balance. Focus on endurance and consistency under longer durations."
	}

	if (wpm >= 85 && accuracy < 90) {
		return "Speed is ahead of control. Reduce pace slightly to recover accuracy and improve effective score."
	}

	if (wpm < 55 && accuracy >= 95) {
		return "Control is strong but pace is conservative. Increase cadence in small increments while preserving precision."
	}

	if (compositeScore >= 80) {
		return "Composite efficiency is strong. Maintain current routine and refine weak-key transitions."
	}

	if (compositeScore >= 55) {
		return "Balanced intermediate profile. Alternate accuracy sessions with controlled speed intervals."
	}

	return "Composite score suggests core fundamentals need reinforcement. Use slower, error-intolerant practice blocks."
}

export const getAnalyticsInsights = (analytics) => {
	if (!analytics) return []

	const wpm = Math.max(0, toNumber(analytics.wpm))
	const accuracy = Math.max(0, Math.min(100, toNumber(analytics.accuracy)))
	const totalPar = Math.max(0, toNumber(analytics.totalPar))
	const compositeScore = Number(((wpm * accuracy) / 100).toFixed(2))

	return [
		getAccuracyInsight(accuracy),
		getSpeedInsight(wpm),
		getPracticeInsight(totalPar),
		getBalanceInsight({ wpm, accuracy, compositeScore, totalPar })
	]
}

export default getAnalyticsInsights