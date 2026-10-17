// Only allow same-site relative paths, to avoid open redirects like `?next=//evil.com`
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return '/';
  }
  return next;
}
