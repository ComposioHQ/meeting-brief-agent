import { Composio } from '@composio/core';
import { NextRequest, NextResponse } from 'next/server';
import { storeConnectionRequest } from '../shared';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }
    
    const composio = new Composio({ apiKey });
    
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userId = `user-${ip}`;
    
    const connectionRequest = await composio.toolkits.authorize(userId, 'googlecalendar');
    
    storeConnectionRequest(userId, connectionRequest);
    
    return NextResponse.json({
      redirectUrl: connectionRequest.redirectUrl
    });
  } catch (error) {
    console.error('Error initiating Google Calendar connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google Calendar connection' },
      { status: 500 }
    );
  }
} 