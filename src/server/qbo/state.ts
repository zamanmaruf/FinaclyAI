// Simple in-memory state storage for OAuth CSRF protection
// In production, use Redis or database for state persistence

let stateStore: Map<string, { timestamp: number }>;

// Initialize state store if not already done
if (typeof global !== 'undefined' && !global.qboStateStore) {
  global.qboStateStore = new Map<string, { timestamp: number }>();
}
stateStore = global.qboStateStore;

export function storeState(state: string): void {
  stateStore.set(state, { timestamp: Date.now() });
  
  // Clean up old states (older than 10 minutes)
  const cutoff = Date.now() - (10 * 60 * 1000);
  for (const [key, value] of stateStore.entries()) {
    if (value.timestamp < cutoff) {
      stateStore.delete(key);
    }
  }
}

export function validateState(state: string): boolean {
  // Check if state exists
  const stateData = stateStore.get(state);
  
  if (!stateData) {
    console.log('❌ State validation failed: state not found');
    return false;
  }
  
  // Check if state is expired (older than 10 minutes)
  const now = Date.now();
  const isExpired = (now - stateData.timestamp) > (10 * 60 * 1000);
  
  if (isExpired) {
    console.log('❌ State validation failed: state expired');
    stateStore.delete(state); // Clean up expired state
    return false;
  }
  
  // Valid state - clean it up and return true
  stateStore.delete(state);
  console.log('✅ State validation successful');
  return true;
}
