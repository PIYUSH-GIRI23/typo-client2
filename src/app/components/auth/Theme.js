import React from 'react'

const Theme = () => {
    return (
        <div className="hidden lg:flex flex-col justify-center items-center w-full h-screen bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white px-8">
           
            <div className="max-w-lg text-center">
                {/* Typing Icon Animation */}
                

                {/* Main Heading */}
                <h1 className="text-5xl font-bold mb-2 leading-tight">
                    Master Your <span className="text-yellow-300">Typing Skills</span>
                </h1>

                {/* Description */}
                <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                    Welcome to <span className="font-bold text-white">Typo</span> - Your ultimate typing speed test platform. Improve your typing speed, accuracy, and consistency with engaging challenges.
                </p>

                {/* Features */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-lg p-4 hover:bg-white/20 transition">
                        <span className="text-2xl">⚡</span>
                        <div className="text-left">
                            <p className="font-semibold">Real-time Speed Analysis</p>
                            <p className="text-sm text-blue-100">Track your WPM and accuracy</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-lg p-4 hover:bg-white/20 transition">
                        <span className="text-2xl">🎯</span>
                        <div className="text-left">
                            <p className="font-semibold">Personalized Challenges</p>
                            <p className="text-sm text-blue-100">Choose difficulty and test types</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-lg p-4 hover:bg-white/20 transition">
                        <span className="text-2xl">📊</span>
                        <div className="text-left">
                            <p className="font-semibold">Detailed Analytics</p>
                            <p className="text-sm text-blue-100">View your progress and statistics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-lg p-4 hover:bg-white/20 transition">
                        <span className="text-2xl">🏆</span>
                        <div className="text-left">
                            <p className="font-semibold">Global Leaderboard</p>
                            <p className="text-sm text-blue-100">Compete with typists worldwide</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-8 border-t border-white/20">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-300">1000+</p>
                        <p className="text-sm text-blue-100">Active Users</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-300">50K+</p>
                        <p className="text-sm text-blue-100">Tests Completed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-300">24/7</p>
                        <p className="text-sm text-blue-100">Available</p>
                    </div>
                </div>

                {/* Quote */}
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-6">
                    <p className="italic text-lg">
                        &quot;The key to success is to practice typing every day. With Typo, make every keystroke count.&quot;
                    </p>
                </div>
            </div>

           
        </div>
    )
}

export default Theme
