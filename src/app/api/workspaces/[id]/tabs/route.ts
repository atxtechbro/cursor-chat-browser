import { NextResponse } from "next/server"
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { existsSync } from 'fs'
import { ComposerData } from "@/types/workspace"

const safeParseTimestamp = (timestamp: number | undefined): string => {
  try {
    if (!timestamp) {
      return new Date().toISOString();
    }
    return new Date(timestamp).toISOString();
  } catch (error) {
    console.error('Error parsing timestamp:', error, 'Raw value:', timestamp);
    return new Date().toISOString();
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workspacePath = process.env.WORKSPACE_PATH || ''
    const dbPath = path.join(workspacePath, params.id, 'state.vscdb')
    const globalDbPath = path.join(workspacePath, '..', 'globalStorage', 'state.vscdb')

    if (!existsSync(dbPath)) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })

    const composerResult = await db.get(`
      SELECT value FROM ItemTable
      WHERE [key] = 'composer.composerData'
    `)

    await db.close()

    const response: { composers?: ComposerData } = {}

    // Handle composer data
    if (composerResult?.value) {
      const composers: ComposerData = JSON.parse(composerResult.value)

      if (existsSync(globalDbPath)) {
        const globalDb = await open({
          filename: globalDbPath,
          driver: sqlite3.Database
        })

        // Get conversation data from global storage
        const keys = composers.allComposers.map((it) => `composerData:${it.composerId}`)
        if (keys.length > 0) {
          const placeholders = keys.map(() => '?').join(',')
          const composersBodyResult = await globalDb.all(`
            SELECT value FROM cursorDiskKV
            WHERE [key] in (${placeholders})
          `, keys)

          if (composersBodyResult) {
            // Process all conversations
            composers.allComposers = composersBodyResult.map((it) => {
              const data = JSON.parse(it.value)
              if (!data.conversation) {
                data.conversation = []
              }
              return data
            })
          }
        }

        await globalDb.close()
      }

      response.composers = composers
    }

    if (!response.composers?.allComposers?.length) {
      return NextResponse.json({ error: 'No composer data found' }, { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to get workspace data:', error)
    return NextResponse.json({ error: 'Failed to get workspace data' }, { status: 500 })
  }
}
