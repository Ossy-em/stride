/**
 * Just enough markdown for Agent answers: paragraphs, bullet and numbered
 * lists, **bold**, *italic*, `code`, and # headings. Builds React elements
 * (no HTML strings), so model output can't inject markup.
 */
import { Fragment, type ReactNode } from "react";

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={`${key}-${i++}`}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={`${key}-${i++}`}>{t.slice(1, -1)}</code>);
    else out.push(<em key={`${key}-${i++}`}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "h"; text: string }
  | { kind: "ul" | "ol"; items: string[] };

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of src.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    const last = blocks[blocks.length - 1];
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const h = /^#{1,4}\s+(.*)$/.exec(line);
    if (!line.trim()) {
      blocks.push({ kind: "p", lines: [] });
    } else if (h) {
      blocks.push({ kind: "h", text: h[1] });
    } else if (ul) {
      if (last?.kind === "ul") last.items.push(ul[1]);
      else blocks.push({ kind: "ul", items: [ul[1]] });
    } else if (ol) {
      if (last?.kind === "ol") last.items.push(ol[1]);
      else blocks.push({ kind: "ol", items: [ol[1]] });
    } else if ((last?.kind === "ul" || last?.kind === "ol") && /^\s{2,}\S/.test(raw)) {
      last.items[last.items.length - 1] += " " + line.trim(); // wrapped list item
    } else if (last?.kind === "p") {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "p", lines: [line] });
    }
  }
  return blocks.filter((b) => b.kind !== "p" || b.lines.length);
}

export default function Markdown({ text }: { text: string }) {
  return (
    <>
      {parse(text).map((b, i) => {
        const k = `b${i}`;
        if (b.kind === "h") return <p key={k} className="md-h">{inline(b.text, k)}</p>;
        if (b.kind === "ul" || b.kind === "ol") {
          const List = b.kind;
          return (
            <List key={k}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it, `${k}-${j}`)}</li>
              ))}
            </List>
          );
        }
        if (b.kind !== "p") return null;
        return (
          <p key={k}>
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l, `${k}-${j}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
