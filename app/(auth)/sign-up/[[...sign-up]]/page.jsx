"use client"

import { SignUp } from '@clerk/nextjs'
import React from 'react'

const Page = () => {
  return (
    <div className="w-full max-w-md">
      <SignUp />
    </div>
  )
}

export default Page