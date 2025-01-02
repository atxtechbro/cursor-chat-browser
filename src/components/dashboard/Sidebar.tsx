"use client"

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { 
  LayoutGrid, 
  List, 
  Clock, 
  Calendar, 
  CalendarDays, 
  Bell,
  Inbox,
  Star,
  Archive,
  Folder
} from 'lucide-react'

interface SidebarProps {
  children?: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="w-72 border-r bg-background/50 backdrop-blur-sm p-6 flex flex-col gap-6 h-screen">
      {/* View Switcher */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-semibold text-muted-foreground ml-2">VIEW</h2>
        <div className="bg-muted/50 rounded-lg p-1 grid grid-cols-3 gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center justify-center">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center justify-center">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Access */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-semibold text-muted-foreground ml-2">QUICK ACCESS</h2>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start h-9">
            <Inbox className="h-4 w-4 mr-3" />
            All Chats
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-9">
            <Star className="h-4 w-4 mr-3" />
            Starred
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-9">
            <Archive className="h-4 w-4 mr-3" />
            Archived
          </Button>
        </div>
      </div>

      {/* Time Filters */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-semibold text-muted-foreground ml-2">TIME FILTERS</h2>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start h-9">
            <Calendar className="h-4 w-4 mr-3" />
            Today
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-9">
            <CalendarDays className="h-4 w-4 mr-3" />
            This Week
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-9">
            <Bell className="h-4 w-4 mr-3" />
            Unread
          </Button>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-2">
          <h2 className="text-xs font-semibold text-muted-foreground">PROJECTS</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Folder className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start h-9 relative group">
            <div className="absolute left-2 w-2 h-2 rounded-full bg-blue-500" />
            <span className="ml-6">Personal</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-9 relative group">
            <div className="absolute left-2 w-2 h-2 rounded-full bg-green-500" />
            <span className="ml-6">Work</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-9 relative group">
            <div className="absolute left-2 w-2 h-2 rounded-full bg-purple-500" />
            <span className="ml-6">Side Projects</span>
          </Button>
        </div>
      </div>

      {children}
    </div>
  )
} 