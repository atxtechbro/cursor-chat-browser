import { NextResponse } from "next/server"
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export async function GET() {
  try {
    const workspacePath = process.env.WORKSPACE_PATH || ''
    console.log('Workspace Path:', workspacePath)

    const globalDbPath = path.join(workspacePath, '..', 'globalStorage', 'state.vscdb')
    console.log('Global DB Path:', globalDbPath)

    if (!existsSync(workspacePath)) {
      console.error('Workspace path does not exist:', workspacePath)
      return NextResponse.json([], { status: 404 })
    }

    const workspaces = []
    const entries = await fs.readdir(workspacePath, { withFileTypes: true })
    console.log('Found workspaces:', entries.length)

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dbPath = path.join(workspacePath, entry.name, 'state.vscdb')
        const workspaceJsonPath = path.join(workspacePath, entry.name, 'workspace.json')
        console.log('Processing workspace:', entry.name)

        // Skip if state.vscdb doesn't exist
        if (!existsSync(dbPath)) {
          console.log(`Skipping ${entry.name}: no state.vscdb found`)
          continue
        }

        try {
          const stats = await fs.stat(dbPath)
          console.log(`Workspace ${entry.name} last modified:`, stats.mtime)

          const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
          })

          // Get composer data references
          const composerResult = await db.get(`
            SELECT value FROM ItemTable 
            WHERE [key] = 'composer.composerData'
          `)

          let composerCount = 0

          // Handle composer data format
          if (composerResult?.value) {
            console.log(`Found composer data for ${entry.name}`)
            const composerData = JSON.parse(composerResult.value)
            composerCount = composerData.allComposers?.length || 0
          }

          // Try to read workspace.json
          let folder = undefined
          try {
            const workspaceData = JSON.parse(await fs.readFile(workspaceJsonPath, 'utf-8'))
            folder = workspaceData.folder
          } catch (error) {
            console.log(`No workspace.json found for ${entry.name}`)
          }

          workspaces.push({
            id: entry.name,
            path: dbPath,
            folder: folder,
            lastModified: stats.mtime.toISOString(),
            composerCount: composerCount
          })

          await db.close()
        } catch (error: any) {
          console.error(`Error processing workspace ${entry.name}:`, error)
          throw error
        }
      }
    }

    // Sort by last modified, newest first
    workspaces.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())

    return NextResponse.json(workspaces)
  } catch (error: any) {
    console.error('Failed to get workspaces:', error)
    return NextResponse.json([], { status: 500 })
  }
} 