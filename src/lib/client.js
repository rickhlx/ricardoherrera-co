// Small browser helpers shared by the writing pages.
let timer;
export function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => (t.hidden = true), 2000);
}

export function copyText(text, selectEl, done = "Copied") {
  const fallback = () => {
    if (selectEl) {
      const r = document.createRange();
      r.selectNodeContents(selectEl);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      toast("Selected. Press Ctrl+C or ⌘C");
    } else toast(text);
  };
  try {
    navigator.clipboard.writeText(text).then(() => toast(done), fallback);
  } catch {
    fallback();
  }
}
