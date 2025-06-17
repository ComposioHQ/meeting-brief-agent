import { NextRequest, NextResponse } from 'next/server';
import { getConnectionRequest } from '../../shared';
import { Composio } from '@composio/core';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userId = `user-${ip}`;
    const composio = new Composio({ apiKey });

    const connectedAccounts = await composio.connectedAccounts.list({
        toolkitSlugs: ['googledocs'],
        userIds: [userId],
      });

    console.log('Google Docs connected accounts:', connectedAccounts);

    if (!connectedAccounts.items || connectedAccounts.items.length === 0) {
      return NextResponse.json({
        connected: false,
        status: 'DISCONNECTED'
      });
    }

    // Find the latest account by createdAt timestamp
    const latestAccount = connectedAccounts.items.reduce((latest, current) => {
      return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
    });

    console.log('Latest Google Docs account:', latestAccount.id, 'Status:', latestAccount.status);

    return NextResponse.json({
      connected: latestAccount.status === 'ACTIVE',
      status: latestAccount.status
    });
  } catch (error) {
    console.error('Error checking Google Docs connection status:', error);
    return NextResponse.json(
      { 
        connected: false,
        status: 'DISCONNECTED',
        error: 'Failed to check connection status'
      },
      { status: 200 }
    );
  }
} 