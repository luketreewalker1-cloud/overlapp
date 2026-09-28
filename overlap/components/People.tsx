import Link from "next/link";
import { dayLabel } from "@/lib/day";

export type Row = { day: string; handle: string };

export default function People({ rows, today }: { rows: Row[]; today: boolean }) {
  return (
    <ul className="rows">
      {rows.map((r) => (
        <li key={r.handle + r.day}>
          <Link href={`/u/${r.handle}`}>
            <span className="ttl">@{r.handle}</span>
            {!today && <span className="meta">{dayLabel(r.day)}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
