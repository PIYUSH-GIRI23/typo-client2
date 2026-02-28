const floor2 = (num) => Math.floor(num * 100) / 100
const floorInt = (num) => Math.floor(num)

const isSameDay = (t1, t2) => {
    const d1 = new Date(t1)
    const d2 = new Date(t2)

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    )
}

const isYesterday = (lastTime, currTime) => {
    const curr = new Date(currTime)
    curr.setDate(curr.getDate() - 1)
    return isSameDay(lastTime, curr.getTime())
}

const findMaxStreak = (oldStreak, lastTestTime, currTestTime) => {

    if (!lastTestTime) return 1

    if (isSameDay(lastTestTime, currTestTime)) return oldStreak

    if (isYesterday(lastTestTime, currTestTime)) return oldStreak + 1
    
    return 1
}


// ---------- CURRENT TEST SCORE ----------

const findCurrentScore = (wrongWordsCount, totalWordsCount, timeTaken) => {

    if (timeTaken === 0 || totalWordsCount === 0 || totalWordsCount < 5) {
        return {
            success: false,
            msg: "Not enough data to calculate score.",
        }
    }

    const correctWordsCount = Math.max(0, totalWordsCount - wrongWordsCount)

    const accuracy = (correctWordsCount / totalWordsCount) * 100
    const rawWpm = (totalWordsCount / timeTaken) * 60
    const netWpm = (correctWordsCount / timeTaken) * 60
    const finalScore = rawWpm * (accuracy / 100)

    return {
        success: true,
        totalWordsCount: totalWordsCount,
        wrongWordsCount : wrongWordsCount,
        correctWordsCount: correctWordsCount,
        timeTaken: timeTaken,

        decimal_accuracy: floor2(accuracy),
        int_accuracy: floorInt(accuracy),

        decimal_rawWpm: floor2(rawWpm),
        int_rawWpm: floorInt(rawWpm),

        decimal_netWpm: floor2(netWpm),
        int_netWpm: floorInt(netWpm),

        decimal_finalScore: floor2(finalScore),
        int_finalScore: floorInt(finalScore)
    }
}


// ---------- DB AGGREGATION ----------

const findDbScore = (
    currWpm,
    prevWpm,
    currAccuracy,
    prevAccuracy,
    currTimeTaken,
    prevTimeTaken,
    prevMaxStreak,
    prevTotalPar,
    prevLastTestTaken
) => {

    const now = Date.now()
    const finalTotalPar = prevTotalPar + 1

    const finalWpm = floorInt((prevWpm * prevTotalPar + currWpm) / finalTotalPar)
    const finalAccuracy = floorInt((prevAccuracy * prevTotalPar + currAccuracy) / finalTotalPar)

    const finalTestTimings = currTimeTaken + prevTimeTaken

    const finalMaxStreak = findMaxStreak(prevMaxStreak, prevLastTestTaken, now)

    return {
        wpm: finalWpm,
        accuracy: finalAccuracy,
        testTimings: finalTestTimings,
        maxStreak: finalMaxStreak,
        lastTestTaken: now,
        totalPar: finalTotalPar
    }
}


// ---------- MAIN PIPELINE ----------

const calculateUpdatedScore = (currSpecs, prevSpecs) => {
    console.log(currSpecs,prevSpecs);
    const currScore = findCurrentScore(
        currSpecs.wrongWordsCount,
        currSpecs.totalWordsCount,
        currSpecs.timeTaken,
    )

    if(!currScore.success) {
        return {
            currScore,
            dbScore: null
        }
    }

    const dbScore = findDbScore(
        currScore.decimal_netWpm,
        prevSpecs.wpm,
        currScore.decimal_accuracy,
        prevSpecs.accuracy,
        currSpecs.timeTaken,
        prevSpecs.testTimings,
        prevSpecs.maxStreak,
        prevSpecs.totalPar,
        prevSpecs.lastTestTaken
    )

    return {
        currScore,
        dbScore
    }
}

export default calculateUpdatedScore