// Public reading context only: never stores credentials, account data or authority.
export function readerReturn(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 240) return null;
  return /^(?:\/(?:library|preferences|radio|newsroom|clips)?|\/clips\/clip-[a-z0-9-]+|\/articles\/[a-z0-9-]+)$/.test(value) ? value : null;
}
export function rememberReaderReturn(value: string) {
  const path = readerReturn(value);
  if (import.meta.client && path) try { localStorage.setItem('aggregator-reader-return', JSON.stringify({path, expires: Date.now()+900000})); } catch { /* Storage may be disabled. */ }
}
export function takeReaderReturn(): string | null {
  if (!import.meta.client) return null;
  try { const raw=localStorage.getItem('aggregator-reader-return'); localStorage.removeItem('aggregator-reader-return'); if (!raw) return null; const item=JSON.parse(raw); return item.expires>Date.now()?readerReturn(item.path):null; } catch { return null; }
}
