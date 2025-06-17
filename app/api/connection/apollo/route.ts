import { Composio, AuthConfigTypes, AuthSchemeTypes } from '@composio/core';
import { NextRequest, NextResponse } from 'next/server';
import { storeConnectionRequest, getApolloApiKey } from '../shared';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }
    const composioApiKey = apiKey;
    const apolloApiKey = getApolloApiKey();
    if (!apolloApiKey) {
      return NextResponse.json(
        { error: 'Apollo API key is not set in environment variables' },
        { status: 500 }
      );
    }
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userId = `user-${ip}`;
    const composio = new Composio({ apiKey: composioApiKey });
    const authConfig = await composio.authConfigs.create(
      'apollo',
      {
        type: AuthConfigTypes.CUSTOM,
        name: 'Apollo',
        authScheme: AuthSchemeTypes.API_KEY,
        credentials: {
          apiKey: apolloApiKey
        }
      }
    );
    const connectionRequest = await composio.connectedAccounts.initiate(userId, authConfig.id);
    console.log('Apollo API key provided:', apolloApiKey.substring(0, 10) + '...');
    console.log('Connection request status:', connectionRequest.status);
    storeConnectionRequest(userId, connectionRequest);
    return NextResponse.json({ status: connectionRequest.status });
  } catch (error) {
    console.error('Error initiating Apollo connection:', error);
    return NextResponse.json(
      { error: `Failed to initiate Apollo connection: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 