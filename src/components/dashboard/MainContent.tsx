"use client"

import { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal } from 'lucide-react'

interface MainContentProps {
  children: ReactNode
}

export function MainContent({ children }: MainContentProps) {
  return (
    <div className="flex-1 overflow-auto bg-muted/5">
      <div className="p-6 border-b sticky top-0 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search chat and composer logs..." 
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="modified">
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modified">Last Modified</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="comfortable">
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Display Density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  )
} 