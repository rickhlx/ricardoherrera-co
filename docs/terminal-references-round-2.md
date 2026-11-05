# Terminal-style homepage references — round 2 (10)

Brief: an interactive site where only certain parts feel like a terminal, plus work history shown as a git log in a command line. Every homepage below was confirmed live on 2026-10-31. The checks read page text and code; nobody has yet looked at the rendered visuals.

## Git-log work history
1. tomplumpton.me — Thomas Plumpton. A whole career drawn as `git log --graph`, with a branch for each life strand (career, open-source, languages). Commits expand into cards. The list stays readable without the graph. (The site renders in the browser, so the structure was confirmed from its README.)
2. bassemfayed.com/en — Bassem Fayed. `git log --oneline` with HEAD on the current entry. Commits are projects, tags are roles, and `shortlog` is a stats strip. Section nav uses git verbs.

## Full terminal
3. kuber.studio — Kuber Mehta. A typed terminal with 30+ commands. Hash links auto-run a command (`#/projects`), so every section can be shared.
4. bnied.dev — Brian Nied. A CRT shell that boots on load. The `crt off|on|max` command sets the glow strength. `resume` generates a PDF from the same JSON. It respects reduced motion.

## Text-interface (TUI)
5. orhun.dev — Orhun Parmaksız. The homepage is a man page, `orhun(1)`. Vim keys and a `less`-style percentage. Joke `--flags` act as the nav.
6. weegs.dev — A file browser you drive with the keyboard, under a Powerlevel-style prompt. A hint bar shows `jk move / l open / h back`. No typing needed.

## Terminal only in parts
7. ellie.wtf — Ellie Huxtable (Atuin). A prompt with a block cursor in the logo and `~/path` section labels. Everything else is a normal page.
8. blog.maximeheckel.com — Maxime Heckel. "Cmd" is a first-class nav item (command palette). A footer panel shows the commit hash and system info.
9. nexxel.dev — Shortcut hints next to each nav item (`[h] home`, `[w] work`). Dense lowercase lists. No prompt.
10. ayaanhafeez.dev — Ayaan Hafeez. A tmux-style window bar for nav and `$ cat pitch.txt` headings. Plain HTML with an optional `:` command line.

## Ideas to combine
- Make `git log` the hero, with real-looking short hashes and HEAD on the current role. `git show <sha>` expands a role.
- Use branches only for parallel strands (work / open source / writing). Tags mark milestones.
- Use `YYYY.MM` (calendar-style) version labels for dates.
- None of these sites use diffs between roles — open ground.
- Keep content as real HTML, with terminal parts layered on top. Offer a `gui` escape and deep links that auto-run commands.
- Effects such as CRT and boot are optional and adjustable, and switch off for visitors who prefer reduced motion.
