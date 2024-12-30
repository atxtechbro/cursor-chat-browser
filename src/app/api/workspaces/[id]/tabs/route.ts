import { NextResponse } from "next/server"
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { existsSync } from 'fs'
import { ChatBubble, ChatTab, ComposerData } from "@/types/workspace"
import { getChatTitle, getMessageContent, isChatPanelConversation } from '../../shared'

interface RawTab {
  tabId: string;
  chatTitle: string;
  lastSendTime: number;
  bubbles: ChatBubble[];
}

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

// Helper to convert composer message type to chat bubble type
const getBubbleType = (msg: any): "ai" | "user" => {
  // Check explicit role first
  if (msg.role === 'user' || msg.context?.role === 'user') return "user";
  if (msg.role === 'ai' || msg.context?.role === 'ai') return "ai";

  // Then check type
  if (msg.type === 1 || msg.context?.type === 1) return "user";
  if (msg.type === 2 || msg.context?.type === 2) return "ai";

  // Default to user if unknown
  return "user";
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

    // Try both old and new chat data formats
    const chatResult = await db.get(`
      SELECT value FROM ItemTable
      WHERE [key] = 'workbench.panel.aichat.view.aichat.chatdata'
    `)

    const composerResult = await db.get(`
      SELECT value FROM ItemTable
      WHERE [key] = 'composer.composerData'
    `)

    await db.close()

    const response: { tabs: ChatTab[], composers?: ComposerData } = { tabs: [] }

    // Handle old chat format
    if (chatResult?.value) {
      try {
        const chatData = JSON.parse(chatResult.value)
        console.log('Raw chat data:', JSON.stringify(chatData, null, 2))

        // Filter out empty chats and ensure bubbles exist
        response.tabs = chatData.tabs
          .filter((tab: RawTab) => {
            console.log('Tab bubbles:', tab.tabId, tab.bubbles?.length || 0)
            return tab.bubbles && tab.bubbles.length > 0
          })
          .map((tab: RawTab) => ({
            id: tab.tabId,
            title: tab.chatTitle?.split('\n')[0] || `Chat ${tab.tabId.slice(0, 8)}`,
            timestamp: safeParseTimestamp(tab.lastSendTime),
            bubbles: tab.bubbles
          }))
        console.log('Filtered tabs:', response.tabs.length)
      } catch (error) {
        console.error('Error parsing chat data:', error)
      }
    }

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
            // First, process all conversations
            composers.allComposers = composersBodyResult.map((it) => {
              const data = JSON.parse(it.value)
              if (!data.conversation) {
                data.conversation = []
              }
              return data
            })

            // Then split into chat vs composer
            const chatConversations = composers.allComposers.filter(composer =>
              isChatPanelConversation(composer.conversation)
            )

            // Add chat conversations to tabs
            chatConversations.forEach(chat => {
              if (chat.conversation?.[0]) {
                const firstMsg = chat.conversation[0];
                response.tabs.push({
                  id: chat.composerId,
                  title: getChatTitle(firstMsg),
                  timestamp: safeParseTimestamp(firstMsg.timestamp),
                  bubbles: chat.conversation.map(msg => ({
                    type: getBubbleType(msg),
                    role: getBubbleType(msg),
                    content: getMessageContent(msg),
                    timestamp: msg.timestamp
                  }))
                })
              }
            })

            // Keep only non-chat conversations in composers
            composers.allComposers = composers.allComposers.filter(composer =>
              !isChatPanelConversation(composer.conversation)
            )
          }
        }

        await globalDb.close()
      }

      response.composers = composers
    }

    if (!response.tabs.length && !response.composers?.allComposers?.length) {
      return NextResponse.json({ error: 'No chat data found' }, { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to get workspace data:', error)
    return NextResponse.json({ error: 'Failed to get workspace data' }, { status: 500 })
  }
}
