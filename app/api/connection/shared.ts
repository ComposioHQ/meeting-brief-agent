const connectionStore = new Map<string, any>();

export function storeConnectionRequest(key: string, connectionRequest: any) {
  connectionStore.set(key, connectionRequest);
}
 
export function getConnectionRequest(key: string): any | undefined {
  return connectionStore.get(key);
}

export function getApolloApiKey(): string | undefined {
  return process.env.APOLLO_API_KEY;
} 