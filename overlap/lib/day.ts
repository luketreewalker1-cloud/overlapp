// The whole site runs on one global day: UTC.
export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dayLabel(day: string): string {
  const today = utcToday();
  const d = new Date(day + "T00:00:00Z");
  const diff = Math.round((Date.parse(today + "T00:00:00Z") - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: diff > 300 ? "numeric" : undefined, timeZone: "UTC" });
}
