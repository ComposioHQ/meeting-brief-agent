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
    
    console.log('Creating Google Docs connection...');
    const startTime = Date.now();
    
    const composio = new Composio({ apiKey });
    
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userId = `user-${ip}`;
    
    const connectionRequest = await composio.toolkits.authorize(userId, 'googledocs');
    
    const timeTaken = Date.now() - startTime;
    console.log(`Google Docs connection created in ${timeTaken}ms`);
    
    storeConnectionRequest(userId, connectionRequest);
    
    if (!connectionRequest.redirectUrl) {
      throw new Error('No redirect URL received from Composio');
    }
    
    return NextResponse.json({
      redirectUrl: connectionRequest.redirectUrl
    });
  } catch (error) {
    console.error('Error initiating Google Docs connection:', error);
          return NextResponse.json(
        { error: `Failed to initiate Google Docs connection: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
  }
} 