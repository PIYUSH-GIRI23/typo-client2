'use client'

import React from 'react'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Login from '@/app/components/auth/Login'

const Theme = dynamic(() => import('@/app/components/Theme'), {
  loading: () => <div className="w-full h-screen bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center"><p className="text-white text-xl">Loading...</p></div>,
  ssr: false 
})

const LoginPage = () => {
  return (
    <div className="flex">
      <div className="hidden lg:block lg:w-1/2">
        <Theme />
      </div>

      <div className="w-full lg:w-1/2">
        <Suspense fallback={null}>
          <Login />
        </Suspense>
      </div>
    </div>
  )
}

export default LoginPage
