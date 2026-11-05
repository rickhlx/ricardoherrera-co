// Share card (Open Graph / X) for a writing post: a 1200×630 PNG in the YN-1 drawing-sheet style,
// rendered at build time with satori (layout → SVG) and resvg (SVG → PNG).
// Fonts are static instances in fonts/ because satori can't pick axes of a variable font.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = process.cwd();
const font = (f) => readFileSync(join(root, "fonts", f));
const FONTS = [
  { name: "Archivo Display", data: font("archivo-800-112.ttf"), weight: 800, style: "normal" },
  { name: "Archivo Label", data: font("archivo-600-82.ttf"), weight: 600, style: "normal" },
  { name: "Martian Mono", data: font("martian-mono-400.ttf"), weight: 400, style: "normal" },
];
const PORTRAIT = `data:image/jpeg;base64,${readFileSync(join(root, "site/photos/portrait.jpg")).toString("base64")}`;

const C = {
  void: "#061020", sheet: "#1b4a88", deep: "#163d71", ink: "#eef4ff", dim: "#b8c9e6",
  hair: "rgba(238,244,255,0.34)", red: "#ffab7a", paper: "#f3f0e8",
};

// Tiny hyperscript so the layout reads like markup without JSX.
const h = (type, style, ...children) => ({ type, props: { style: { display: "flex", ...style }, children: children.flat() } });
const text = (style, s) => ({ type: "div", props: { style: { display: "flex", ...style }, children: s } });

function cell(label, value, flex) {
  return h("div", { flexDirection: "column", flex, minWidth: 0, padding: "9px 12px", borderLeft: `1px solid ${C.hair}` },
    text({ fontFamily: "Martian Mono", fontSize: 10, letterSpacing: 1.4, color: C.dim, marginBottom: 4 }, label.toUpperCase()),
    text({ fontFamily: "Archivo Label", fontSize: 17, letterSpacing: 0.6, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, value.toUpperCase()),
  );
}

/**
 * @param {{ title: string, dek: string, date: string, rev: string, minutes: number, tags: string[] }} post
 * @returns {Promise<Buffer>} PNG bytes
 */
export async function renderPostCard({ title, dek, date, rev, minutes, tags }) {
  const titleSize = title.length <= 34 ? 66 : title.length <= 60 ? 54 : title.length <= 90 ? 44 : 38;

  // Boxes are sized and placed explicitly: satori doesn't take padding out of a fixed-size root.
  const tree = h("div", { width: 1200, height: 630, background: C.void, position: "relative" },
    h("div", { position: "absolute", left: 44, top: 50, width: 1132, height: 562, background: "rgba(0,0,0,0.35)" }),
    h("div", { position: "absolute", left: 34, top: 34, width: 1132, height: 562, background: C.sheet },
      h("div", { position: "absolute", left: 7, top: 7, width: 1118, height: 548, border: `1px solid ${C.hair}` }),
      h("div", { position: "absolute", left: 12, top: 12, width: 1108, height: 538, flexDirection: "column", border: `1.5px solid ${C.ink}` },
        // drawing area
        h("div", { flex: 1, minHeight: 0 },
          // text column
          h("div", { flex: 1, minWidth: 0, flexDirection: "column", padding: "40px 40px 30px 44px" },
            h("div", { alignSelf: "flex-start", border: `2px solid ${C.red}`, padding: "6px 12px 5px", transform: "rotate(-2deg)", marginBottom: 30 },
              text({ fontFamily: "Archivo Label", fontSize: 15, letterSpacing: 2, color: C.red }, `WRITING · SHEET 04 · REV ${rev}`),
            ),
            text({ fontFamily: "Archivo Display", fontSize: titleSize, lineHeight: 1.04, letterSpacing: -0.5, color: C.ink, marginBottom: 22 }, title),
            text({ display: "block", fontFamily: "Martian Mono", fontSize: 17, lineHeight: 1.6, color: C.dim, lineClamp: 3 }, dek),
            h("div", { marginTop: "auto", gap: 18, fontFamily: "Martian Mono", fontSize: 13, letterSpacing: 0.8, color: C.dim },
              text({}, `${minutes} MIN READ`),
              ...tags.slice(0, 3).map((t) => text({ color: C.ink }, `#${t}`)),
            ),
          ),
          // portrait print, paper-clipped like sheet 01
          h("div", { width: 250, flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${C.hair}`, padding: "0 24px" },
            h("div", { flexDirection: "column", alignItems: "center", transform: "rotate(3deg)" },
              h("div", { background: C.paper, padding: 9, boxShadow: "0 14px 28px rgba(0,0,0,0.42)" },
                { type: "img", props: { src: PORTRAIT, width: 168, height: 168, style: { objectFit: "cover" } } },
              ),
              text({ fontFamily: "Martian Mono", fontSize: 11, letterSpacing: 1.4, color: C.dim, marginTop: 12 }, "FIG. 0 · OPERATOR"),
            ),
          ),
        ),
        // title block
        h("div", { height: 58, background: C.deep, borderTop: `1.5px solid ${C.ink}`, marginLeft: -1 },
          cell("Drawn", "Ricardo Herrera", 2.1),
          cell("Title", title, 3.4),
          cell("Date", date, 1.5),
          cell("Site", "ricardoherrera.co", 2.1),
          cell("Rev", rev, 0.6),
        ),
      ),
    ),
  );

  const svg = await satori(tree, { width: 1200, height: 630, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
