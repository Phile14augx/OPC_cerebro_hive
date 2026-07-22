/**
 * Resolve the scheduled publish time for a platform.
 * If the frontmatter specifies a time (e.g. "09:00"), schedule it for today at that time.
 * If no schedule is provided, publish immediately.
 */
export function resolvePublishTime(
  platform: string,
  schedule: Record<string, string> | undefined
): Date | null {
  if (!schedule || !schedule[platform]) return null;

  const timeStr = schedule[platform]; // "09:00"
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (target <= new Date()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

/**
 * Wait until the given Date, then resolve.
 */
export async function waitUntil(target: Date): Promise<void> {
  const delay = target.getTime() - Date.now();
  if (delay <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
