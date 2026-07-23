export function debugLog(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
}

export function debugWarn(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(...args);
  }
}
