import { NextRequest, NextResponse } from 'next/server';
import { AuthSchemeType, AuthConfigType, Composio, AuthConfigTypes, AuthSchemeTypes } from '@composio/core';

export async function POST(request: NextRequest) {
  try {
    const { apiKey: composioApiKey, apolloApiKey } = await request.json();
    
    if (!composioApiKey) {
      return NextResponse.json(
        { error: 'Composio API key is required' },
        { status: 400 }
      );
    }

    if (!apolloApiKey) {
      return NextResponse.json(
        { error: 'Apollo API key is required' },
        { status: 400 }
      );
    }

    const composio = new Composio({ apiKey: composioApiKey });
    const authConfig = await composio.authConfigs.create(
      'apollo',
      {
        type:AuthConfigTypes.CUSTOM,
        name:'Apollo',
        authScheme:AuthSchemeTypes.API_KEY,
        credentials:{
          apiKey:apolloApiKey
        }
      }
    )
    const connectionRequest = await composio.connectedAccounts.initiate('default', authConfig.id);
    
    console.log('Apollo API key provided:', apolloApiKey.substring(0, 10) + '...');
    console.log('Connection request status:', connectionRequest.status);

    return NextResponse.json({
      status: 'connected',
      connectionStatus: connectionRequest.status
    });

  } catch (error) {
    console.error('Error connecting Apollo:', error);
    return NextResponse.json(
      { error: 'Failed to connect Apollo' },
      { status: 500 }
    );
  }
} 