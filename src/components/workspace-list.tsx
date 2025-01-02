"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Workspace } from "@/types/workspace"
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loading } from "@/components/ui/loading"
import path from 'path'

function normalizePath(filePath: string) {
  // Decode the URL-encoded path
  const decodedPath = filePath
    .replace(/^file:\/\/\//, '')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
    .replace(/%5C/g, '\\')
    .replace(/%20/g, ' ')

  // Get the last two segments of the path for display
  const segments = decodedPath.split(/[\\/]/)
  const shortPath = segments.slice(-2).join('\\')

  return {
    fullPath: decodedPath,
    shortPath
  }
}

export function WorkspaceList() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        if (!Array.isArray(data)) {
          console.error('Expected array of workspaces, got:', data)
          setWorkspaces([])
          return
        }

        // Fetch composer counts for each workspace
        const workspacesWithCounts = await Promise.all(
          data.map(async (workspace: Workspace) => {
            try {
              const tabsRes = await fetch(`/api/workspaces/${workspace.id}/tabs`)
              if (!tabsRes.ok) {
                console.warn(`Failed to fetch tabs for workspace ${workspace.id}`)
                return {
                  ...workspace,
                  composerCount: 0
                }
              }
              const tabsData = await tabsRes.json()
              return {
                ...workspace,
                composerCount: tabsData.composers?.allComposers?.length || 0
              }
            } catch (error) {
              console.warn(`Error fetching tabs for workspace ${workspace.id}:`, error)
              return {
                ...workspace,
                composerCount: 0
              }
            }
          })
        )

        setWorkspaces(workspacesWithCounts)
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)
        setWorkspaces([])
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [])

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/workspace/${workspaceId}`)
  }

  if (loading) {
    return <Loading message="Loading workspaces..." />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace Hash</TableHead>
            <TableHead>Folder</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="text-right">Composer Logs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workspaces
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
            .filter(workspace => workspace.composerCount > 0)
            .map((workspace) => (
              <TableRow key={workspace.id} className="hover:bg-accent/50">
                <TableCell>
                  <button
                    onClick={() => handleWorkspaceClick(workspace.id)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {workspace.id}
                  </button>
                </TableCell>
                <TableCell>
                  {workspace.folder ? (
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-500 mt-1">📁</span>
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-medium"
                          title={normalizePath(workspace.folder).fullPath}
                        >
                          {normalizePath(workspace.folder).shortPath}
                        </span>
                        <span className="text-xs text-muted-foreground break-all">
                          {normalizePath(workspace.folder).fullPath}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No folder</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(workspace.lastModified), 'PPP p')}
                </TableCell>
                <TableCell className="text-right">
                  {workspace.composerCount}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}