const connectionStore = new Map<string, any>();

export function storeConnectionRequest(key: string, connectionRequest: any) {
  connectionStore.set(key, connectionRequest);
}

export function getConnectionRequest(key: string): any | undefined {
  return connectionStore.get(key);
} 