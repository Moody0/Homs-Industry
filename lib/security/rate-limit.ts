import "server-only";

type AttemptState = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, AttemptState>();

export function isRateLimited(key: string, limit = 6, windowMs = 60_000) {
  const now = Date.now();
  const normalizedKey = key.trim().toLowerCase();
  const current = attempts.get(normalizedKey);

  if (!current || current.resetAt <= now) {
    attempts.set(normalizedKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  attempts.set(normalizedKey, current);

  return current.count > limit;
}
