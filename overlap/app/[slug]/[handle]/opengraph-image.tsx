import { ImageResponse } from "next/og";
import { SITE_NAME, TYPE_WORD, type WorkType } from "@/lib/slug";
import { sharedPick } from "./data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A pick shared on Overlap";

const TINT: Record<WorkType, string> = { film: "#2F4FD6", book: "#1F7A55", song: "#B42E7E" };

// The card X and other sites show when someone posts their link.
export default async function Image({ params }: { params: Promise<{ slug: string; handle: string }> }) {
  const { slug, handle } = await params;
  const p = await sharedPick(slug, handle);
  const title = p?.title ?? "Nothing here";
  const type = (p?.type ?? "film") as WorkType;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#EEF0F4", color: "#1C1B29" }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{SITE_NAME}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, color: TINT[type] }}>{p ? `${TYPE_WORD[type]} by ${p.creator}` : ""}</div>
          <div style={{ display: "flex", fontSize: title.length > 40 ? 64 : 92, fontWeight: 700, lineHeight: 1.05, marginTop: 12 }}>{title}</div>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#63647A" }}>{p ? `picked by @${p.handle}` : ""}</div>
      </div>
    ),
    size
  );
}
