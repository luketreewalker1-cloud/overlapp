// Title + creator, so every version of the same work shares one room.
export function slugify(title: string, creator: string): string {
  return `${title} ${creator}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&|\+/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = SITE_URL.replace(/^https?:\/\//, "");

export type WorkType = "film" | "book" | "song";
export type Work = { type: WorkType; key: string; title: string; creator: string; year: number | null };
export const TYPE_WORD: Record<WorkType, string> = { film: "Film", book: "Book", song: "Song" };
