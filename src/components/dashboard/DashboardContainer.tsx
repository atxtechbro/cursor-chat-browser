"use client"

import { ReactNode } from 'react'

interface DashboardContainerProps {
  children: ReactNode
}

export function DashboardContainer({ children }: DashboardContainerProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {children}
    </div>
  )
} 