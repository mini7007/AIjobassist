"use client"

import { SignIn } from '@clerk/nextjs'
import React from 'react'

const Page = () => {
  return (
    <div className="w-full max-w-md">
      <SignIn />
    </div>
  )
}

export default Page