---
title: How I built Memo, my personal AI assistant
dek: A month of building an assistant that lives in my notes, talks to me on Telegram, and runs on a small server. What it does, how it's put together, and what I'd tell anyone building their own.
date: 2026-11-09
tags: [ai, agents, automation, reliability]
draft: true
---

<!-- DRAFT: working prose in my voice. Replace the TODO notes with my own moments.
     Check before publishing: anything personal I'd rather keep out (health, family, faith),
     and keep the location provider unnamed (it is my employer's product). -->

I have ADHD. For me, a thought I don't write down in the next ten seconds is gone. For years my notes app was full of half-captured ideas, and my calendar was a list of things I'd already forgotten to prepare for.

So last month I built an assistant. I named it — well, it named itself — Memo. It lives in my Obsidian vault, I talk to it on Telegram, and it runs on a small server that costs me less than lunch. A month in, it's the most useful software I use every day.

<!-- TODO: one real moment from before Memo. The thing I forgot that made me start. -->

## What it does

On a normal day:

- **I capture, it files.** I send a message, a photo or a voice note. If it isn't a question, Memo writes it into my inbox as a note, word for word, reacts with a 👍 and says nothing else. Filing happens later, in a batch.
- **It briefs me.** A morning brief with the day's calendar, the weather, drive times and anything due. An evening wrap with tomorrow. A Sunday review that asks me what I shipped this week.
- **It reminds me, by time or by place.** "Remind me at 3 to call the bank" pings me at 3. "Remind me when I get home" waits until my phone says I'm home.
- **It handles the logistics I drop.** It adds calendar events, works out when to leave, and warms up the car before a drive.
- **It keeps the boring lists.** Next actions, the grocery inventory, a meal plan, a film-a-week list.

<!-- TODO: the moment it first felt useful. -->

## How it's built

Nothing here is exotic. That's the point.

```text title="the pieces"
Telegram  ──►  Claude Code (headless, systemd service)  ──►  Obsidian vault (git)
                     │
systemd timers ──►  claude -p "<prompt>"  ──►  Telegram (or nothing)
                     │
phone webhooks ──►  small Python server  ──►  reminders, place triggers
```

**The brain is Claude Code, run headless.** One long-running Claude Code session listens to my Telegram chat through a channel plugin, under a systemd service. Its working directory is my vault. When I send a message, it reads the vault, does the work, and replies.

**The memory is the vault.** Memo starts every conversation fresh. It only knows what's written down. So the vault has a `CLAUDE.md` with the conventions (where notes go, how hubs work, how to format a reminder), and Memo keeps its own notes too: what it has learned about how to work with me, and a journal. If it isn't written, Memo doesn't know it. That turned out to be a feature: I can read and edit everything it "remembers".

**Every turn is a git commit.** A timer commits the vault every turn, so "undo that" is a `git revert`. I've used it more than once.

**Scheduled jobs are just prompts.** The morning brief, the evening wrap, the Sunday review, the inbox filing: each is a Markdown prompt file and a systemd timer. A small shell script gathers the context the prompt needs (calendar, weather, drive times) and runs `claude -p` with read-only tools. If the model outputs `NOTHING`, nothing is sent.

```bash title="bin/push (the core of it)"
out=$(cd "$HOME/vault" && claude -p "$prompt" --model sonnet --tools Read,Grep,Glob)
[ "$out" = NOTHING ] || printf '%s\n' "$out" | "$root/bin/send"
```

**The hands are small scripts.** Each integration is a short Python script with a test: the iCloud calendar over CalDAV, the weather, drive times, nearby places, the car's API, a local Whisper model for voice notes. Memo calls them like any other command. Standard library wherever I could, so there's almost nothing to upgrade.

**The phone talks back through a webhook.** A tiny Python HTTP server, reached through a Cloudflare tunnel, takes events from my phone: Shortcuts automations ("I got in the car") and location geofences ("arrived home"). Those fire place reminders. Arriving at a store can trigger a short check: is anything on my buy list sold here?

By the numbers, a month in: about 110 commits, around 3,500 lines of scripts, 21 test files, and a few dozen systemd timers.

## What I learned

**Make capture free.** Everything else depends on it. If saving a thought costs me a decision (which folder? which tag?), I don't save it. Memo saves first and organizes later, in batches. I never file anything myself.

**Deterministic where you can, model where you must.** "I got home" doesn't need a language model; a geofence fires a trigger and the reminders go out. The model gets the fuzzy jobs: understanding a voice note, deciding whether a store visit is worth a message, writing the brief.

**Read-only by default.** The scheduled jobs can read the vault but can't change it. Only the conversation can, and every change is a commit I can revert.

**Treat it like a pager.** This one surprised me. The assistant that was supposed to lower my mental load became my noisiest pager: briefs, nudges, check-ins, reminders, car alerts. So I did what I do at work: a message budget, page only when a human has to act now, retry transient errors instead of alerting on them, and push anything that can wait into the next brief. I'll write that one up separately.

<!-- TODO: how many messages a day at the worst, and now. Memo can count them from the sent log. -->

**Let it write down how to work with you.** When I correct Memo, it writes the lesson in its own notes: "when he asks for examples, send the picture with the advice", "don't split one task into many reminders". The next session reads them. It's the closest thing to an assistant that actually learns.

**Give it a name.** I asked it to pick one. It chose Memo: a memo is a note, and in Spanish Memo is the friendly short form of Guillermo. It sounds like a friend, not a machine. That changed how I talk to it, which changed how much I use it.

## What I'd do differently

<!-- TODO: my own list. Some candidates:
     - Start with the message budget on day one.
     - Fewer scheduled jobs, more on-demand.
     - Decide earlier what my wife can see, and give her a separate bot instead of a shared one. -->

## If you want to build your own

Start small: one Telegram chat, one headless agent pointed at a folder of Markdown notes, and a `CLAUDE.md` that says how you want things captured. Add one timer for a morning brief. Live with it for a week before adding anything else.

<!-- TODO: decide how public the setup is. Share the repo, or describe it only? -->
