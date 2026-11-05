// Markdown extensions for posts in src/content/writing/.
import { visit } from "unist-util-visit";

const CALLOUTS = { NOTE: "Note", TIP: "Tip", IMPORTANT: "Important", WARNING: "Warning", CAUTION: "Caution" };

/**
 * GitHub-style callouts:
 *   > [!NOTE]
 *   > Text of the note.
 * Renders <aside class="callout note"><b>Note</b>…</aside>.
 */
export function remarkCallouts() {
  return (tree) => {
    visit(tree, "blockquote", (node) => {
      const para = node.children[0];
      const text = para?.type === "paragraph" && para.children[0];
      if (!text || text.type !== "text") return;
      const m = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i.exec(text.value);
      if (!m) return;
      const kind = m[1].toUpperCase();
      text.value = text.value.slice(m[0].length);
      if (!text.value) para.children.shift();
      if (para.children[0]?.type === "break") para.children.shift();
      if (!para.children.length) node.children.shift();
      const cls = ["callout", kind.toLowerCase()];
      if (kind === "WARNING" || kind === "CAUTION") cls.push("warn");
      node.data = { hName: "aside", hProperties: { className: cls } };
      node.children.unshift({
        type: "paragraph",
        data: { hName: "b", hProperties: { className: ["callout-label"] } },
        children: [{ type: "text", value: CALLOUTS[kind] }],
      });
    });
  };
}

/**
 * Runs after heading ids are assigned:
 * - adds a "#" link to each h2/h3 so readers can share a section,
 * - wraps tables in a scroll container so wide tables don't widen the page.
 */
export function rehypePostBody() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id && node.properties.id !== "footnote-label") {
        node.children.unshift({
          type: "element",
          tagName: "a",
          properties: { className: ["anchor"], href: `#${node.properties.id}`, ariaLabel: "Link to this section" },
          children: [{ type: "text", value: "#" }],
        });
      }
      if (node.tagName === "table" && parent && !(parent.properties?.className || []).includes("table")) {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table"] },
          children: [node],
        };
      }
    });
  };
}

/**
 * Wraps every highlighted code block in a frame with a caption and a copy button.
 * ```yaml title="nodepool.yaml"   -> caption "nodepool.yaml"
 * ```bash                         -> caption "bash"
 */
export function shikiCodeFrame() {
  return {
    name: "code-frame",
    root(root) {
      const raw = this.options.meta?.__raw || "";
      const title = /title="([^"]+)"/.exec(raw)?.[1] || /title='([^']+)'/.exec(raw)?.[1];
      const lang = this.options.lang && this.options.lang !== "plaintext" ? this.options.lang : "";
      const caption = title || lang || "code";
      return {
        type: "root",
        children: [{
          type: "element",
          tagName: "figure",
          properties: { className: ["code"] },
          children: [
            {
              type: "element",
              tagName: "header",
              properties: {},
              children: [
                { type: "element", tagName: "span", properties: {}, children: [{ type: "text", value: caption }] },
                { type: "element", tagName: "button", properties: { type: "button", className: ["btn", "copy"] }, children: [{ type: "text", value: "Copy" }] },
              ],
            },
            ...root.children,
          ],
        }],
      };
    },
  };
}
