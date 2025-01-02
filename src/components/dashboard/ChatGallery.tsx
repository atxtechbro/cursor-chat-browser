"use client"

import { useState } from 'react'
import { format } from "date-fns"
import { Workspace } from "@/types/workspace"
import { normalizePath } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Calendar } from 'lucide-react'

interface ChatGalleryProps {
  workspaces: Workspace[]
  viewMode: 'list' | 'grid' | 'timeline'
  density: 'compact' | 'comfortable' | 'spacious'
}

export function ChatGallery({ workspaces, viewMode = 'list', density = 'comfortable' }: ChatGalleryProps) {
  const getDensityClass = () => {
    switch (density) {
      case 'compact': return 'gap-3'
      case 'spacious': return 'gap-6'
      default: return 'gap-4'
    }
  }

  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${getDensityClass()}`}>
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="hover:bg-accent/5 hover:shadow-md transition-all duration-200 cursor-pointer border-muted/50">
            <CardHeader className="p-5">
              <CardTitle className="text-base truncate flex items-center gap-2">
                {workspace.folder ? normalizePath(workspace.folder).shortPath : workspace.id}
                <Badge variant="secondary" className="ml-auto">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {workspace.composerCount}
                </Badge>
              </CardTitle>
              <CardDescription className="truncate text-xs">
                {workspace.folder ? normalizePath(workspace.folder).fullPath : 'No folder'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(workspace.lastModified), 'PPP')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (viewMode === 'timeline') {
    const groupedByDate = workspaces.reduce((groups, workspace) => {
      const date = format(new Date(workspace.lastModified), 'PPP')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(workspace)
      return groups
    }, {} as Record<string, Workspace[]>)

    return (
      <div className="space-y-8">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {date}
            </h3>
            <div className="space-y-3">
              {items.map((workspace) => (
                <Card key={workspace.id} className="hover:bg-accent/5 hover:shadow-md transition-all duration-200 cursor-pointer border-muted/50">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {workspace.folder ? normalizePath(workspace.folder).shortPath : workspace.id}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {workspace.folder ? normalizePath(workspace.folder).fullPath : 'No folder'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {workspace.composerCount}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Default list view
  return (
    <div className="space-y-3">
      {workspaces.map((workspace) => (
        <Card key={workspace.id} className="hover:bg-accent/5 hover:shadow-md transition-all duration-200 cursor-pointer border-muted/50">
          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-base flex items-center gap-2">
                  {workspace.folder ? normalizePath(workspace.folder).shortPath : workspace.id}
                </CardTitle>
                <CardDescription className="text-xs">
                  {workspace.folder ? normalizePath(workspace.folder).fullPath : 'No folder'}
                </CardDescription>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(workspace.lastModified), 'PPP')}
                </div>
              </div>
              <Badge variant="secondary" className="h-6">
                <MessageSquare className="h-3 w-3 mr-1" />
                {workspace.composerCount}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
} 