import { NextRequest, NextResponse } from 'next/server'
import { Composio } from '@composio/core'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { VercelProvider } from '@composio/vercel'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { apiKey } = body
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const userId = `user-${ip}`;
  const composio = new Composio({
    apiKey,
    provider: new VercelProvider(),
  })
  const userMessage = `
  You are a Meeting Brief Agent that researches the person and company I am meeting with.
  You have to generate a meeting brief report for the meeting.
  You have the following tools at your disposal:
  - Google Calendar: Fetch events by Google Calendar
  - Apollo: Search for people
  - Composio Search: Search for companies
  - Google Docs: Create and update documents

  You have to use the tools to generate the meeting brief report.
  Search the internet for the person and the company together. Gather as much info and then use that info to search on Apollo and get verified information.
  Fetch events by Google Calendar, here's the parameters to pass:
  timeMin	Current timestamp
  order_by	"startTime"	  
  max_results	1

  `
  const tools = await composio.tools.get(userId, {
    tools: [
      'GOOGLECALENDAR_GET_CALENDAR',
      'GOOGLECALENDAR_GET_CURRENT_DATE_TIME',
      'GOOGLECALENDAR_FIND_EVENT',
      'COMPOSIO_SEARCH_TAVILY_SEARCH',
      'GOOGLECALENDAR_FIND_FREE_SLOTS',
      'APOLLO_PEOPLE_SEARCH',
      'GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN',
      'GOOGLEDOCS_UPDATE_DOCUMENT_MARKDOWN'
    ]
  }, {
    beforeExecute: async (toolSlug: string, toolkitSlug: string, toolExecuteParams) => {
      console.log(`🔄 Executing tool: ${toolSlug} from toolkit: ${toolkitSlug}`);
      console.log(JSON.stringify(toolExecuteParams, null, 2))
      return toolExecuteParams
    }
  })
  const messages: any[] = [
    { role: 'user', content: userMessage },
  ]
  async function chatCompletion() {
    const { text } = await generateText({
      model: openai('gpt-4.1'),
      tools: tools,
      messages,
      maxSteps: 50,

    })
    return text
  }
  const report = await chatCompletion()
  return NextResponse.json({ report })
} 