"use client"

import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-red-500 rounded-lg animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-gray-600 font-medium text-center">
          <span className="inline-block">Processing</span>
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner
