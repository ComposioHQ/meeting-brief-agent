import { NextRequest, NextResponse } from 'next/server'
import { Composio } from '@composio/core'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { VercelProvider } from '@composio/vercel'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { apiKey } = body
  const composio = new Composio({
    apiKey,
    provider: new VercelProvider(),
  })
  const userMessage = `
  Fetch the latest 5 meeting details from my google calendar for the id: karan@composio.dev. 
  Research the company and the person I am meeting with.
  Generate a meeting brief report for the meeting.
  Then you have to create a contact in hubspot with all the relevant details.
  Non negotiable details: firstname, lastname, company, email, fill any extra details that you think are relevant.
  The meeting brief report should be in the following format:
  - Meeting details
  - Person research (100 words) with apollo and search tools
  - Company research (100 words) with search tools
 You have full permission to use the tools and complete all the tasks.
  `
  const tools = await composio.tools.get('default', {
    tools: [
      'GOOGLECALENDAR_GET_CALENDAR',
      'GOOGLECALENDAR_GET_CURRENT_DATE_TIME',
      'COMPOSIO_SEARCH_SEARCH',
      'COMPOSIO_SEARCH_TAVILY_SEARCH',
      'GOOGLECALENDAR_FIND_EVENT',
      'GOOGLECALENDAR_FIND_FREE_SLOTS',
      'APOLLO_PEOPLE_SEARCH',
      'HUBSPOT_CREATE_CONTACT_OBJECT_WITH_PROPERTIES'
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