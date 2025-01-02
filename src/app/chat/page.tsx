"use client"

import { useState } from 'react'
import { DashboardContainer } from '@/components/dashboard/DashboardContainer'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MainContent } from '@/components/dashboard/MainContent'
import { ChatGallery } from '@/components/dashboard/ChatGallery'
import { WorkspaceList } from '@/components/workspace-list'

export default function ChatPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list')
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable')

  return (
    <DashboardContainer>
      <Sidebar />
      <MainContent>
        <WorkspaceList />
      </MainContent>
    </DashboardContainer>
  )
} 