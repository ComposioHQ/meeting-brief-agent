import { NextRequest, NextResponse } from 'next/server'
import { Composio } from '@composio/core'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { VercelProvider } from '@composio/vercel'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey } = body
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userId = `user-${ip}`;
    console.log('[MeetingBrief] Received request', { ip, userId, hasApiKey: !!apiKey })

    if (!apiKey) {
      console.log('[MeetingBrief] Missing Composio API key from input')
      return NextResponse.json({ error: 'Composio API key is required.' }, { status: 400 });
    }

    // 1. Calendar Agent (frontend API key)
    console.log('[MeetingBrief] Starting calendar agent')
    const composioCalendar = new Composio({
      apiKey,
      provider: new VercelProvider(),
    })
    const calendarTools = await composioCalendar.tools.get(userId, {
      tools: [
        'GOOGLECALENDAR_GET_CALENDAR',
        'GOOGLECALENDAR_GET_CURRENT_DATE_TIME',
        'GOOGLECALENDAR_FIND_EVENT',
        'GOOGLECALENDAR_FIND_FREE_SLOTS',
      ]
    })
    const calendarPrompt = `You are a calendar agent. Fetch all relevant meeting and event details from Google Calendar for the user. Output all information you can get about the next meeting. Use List calendars to find the account owner's email and ensure that the account owner is not included in the meeting participants or researched. Output all meeting details except for the account owner.
    When finding events, use the following parameters:
    timeMin: Current timestamp
    order_by: "startTime"  
    max_results: 1
    `
    const calendarMessages = [
      { role: 'user' as const, content: calendarPrompt },
    ]
    const calendarResult = await generateText({
      model: openai('gpt-4.1'),
      tools: calendarTools,
      messages: calendarMessages,
      maxSteps: 20,
    })
    console.log('[MeetingBrief] Calendar agent result:', calendarResult.text)

    if (!process.env.COMPOSIO_API_KEY) {
      console.log('[MeetingBrief] Missing COMPOSIO_API_KEY in env')
      return NextResponse.json({ error: 'Composio API key for research agent is not set in environment variables.' }, { status: 500 });
    }

    // 2. Research Agent (env API key)
    console.log('[MeetingBrief] Starting research agent')
    const composioResearch = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY!,
      provider: new VercelProvider(),
    })
    const researchTools = await composioResearch.tools.get('default', {
      tools: [
        'APOLLO_PEOPLE_SEARCH',
        'COMPOSIO_SEARCH_TAVILY_SEARCH',
      ]
    })
    const researchPrompt = `You are a Meeting Brief Agent that researches the person and company the user is meeting with. Given the following meeting details, research the person and company using Apollo and search tools.\n\nInstructions:\n- Do not research the account owner.\n- Use the meeting details to identify the person and company.\n- Search the internet for the person and the company together. Gather as much info and then use that info to search on Apollo and get verified information.\n- Output should be detailed, accurate, and relevant.\n\nMeeting details:\n${calendarResult.text}`
    const researchMessages = [
      { role: 'user' as const, content: researchPrompt },
    ]
    const researchResult = await generateText({
      model: openai('gpt-4.1'),
      tools: researchTools,
      messages: researchMessages,
      maxSteps: 30,
    })
    console.log('[MeetingBrief] Research agent result:', researchResult.text)

    // 3. Google Docs Agent (frontend API key)
    console.log('[MeetingBrief] Starting docs agent')
    const composioDocs = new Composio({
      apiKey,
      provider: new VercelProvider(),
    })
    const docsTools = await composioDocs.tools.get(userId, {
      tools: [
        'GOOGLEDOCS_CREATE_DOCUMENT_MARKDOWN',
        'GOOGLEDOCS_UPDATE_DOCUMENT_MARKDOWN',
      ]
    })
    const docsPrompt = `You are a documentation agent. Take the following research and write a detailed meeting brief in markdown format. Save it in a Google Doc.\n\nResearch:\n${researchResult.text}`
    const docsMessages = [
      { role: 'user' as const, content: docsPrompt },
    ]
    const docsResult = await generateText({
      model: openai('gpt-4.1'),
      tools: docsTools,
      messages: docsMessages,
      maxSteps: 20,
    })
    console.log('[MeetingBrief] Docs agent result:', docsResult.text)

    return NextResponse.json({
      calendar: calendarResult.text,
      research: researchResult.text,
      report: docsResult.text,
    })
  } catch (error) {
    console.error('[MeetingBrief] Unhandled error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 