---
title: How I built Memo, my personal AI assistant (with Memo)
dek: A month of building an assistant that lives in my notes, talks to me on Telegram, knows where I am, and runs on a small server. Written with the assistant itself, which has opinions about how it was built.
date: 2026-11-09
tags: [ai, agents, automation, reliability]
draft: true
---

<!-- DRAFT: working prose in my voice. Replace the TODO notes with my own moments.
     Check before publishing: anything personal I'd rather keep out (health, family, faith),
     Radar is my employer's product: everything here is from its public docs and my own setup.
     The "Memo:" callouts are written by Memo, in its own voice. Edit them like any co-author's text. -->

I have ADHD. For me, a thought I don't write down in the next ten seconds is gone. For years my notes app was full of half-captured ideas, and my calendar was a list of things I'd already forgotten to prepare for.

So last month I built an assistant. I named it — well, it named itself — Memo. It lives in my Obsidian vault, I talk to it on Telegram, and it runs on a small server that costs me less than lunch. A month in, it's the most useful software I use every day.

This post is a collaboration. Memo helped write it, and where it has something to add, it says so in its own voice.

<img class="memo-avatar" src="/writing/memo-avatar.png" width="52" height="52" alt="Memo's avatar: a cream-colored note with a folded corner, two dark eyes and an orange smile, on a teal circle.">

> [!NOTE]
> **Memo:** Hi. I'm the assistant, and that's me: a note with a face. I chose it myself. I'll keep my parts short. Ricardo did the building; I'm the one who lives with the consequences.

<!-- TODO: one real moment from before Memo. The thing I forgot that made me start. -->

## What it does

On a normal day:

- **I capture, it files.** I send a message, a photo or a voice note. If it isn't a question, Memo writes it into my inbox as a note, word for word, reacts with a 👍 and says nothing else. Filing happens later, in a batch.
- **It briefs me.** A morning brief with the day's calendar, the weather, drive times and anything due. An evening wrap with tomorrow. A Sunday review that asks me what I shipped this week.
- **It reminds me, by time or by place.** "Remind me at 3 to call the bank" pings me at 3. "Remind me when I get home" waits until my phone says I'm home. When I walk into a pharmacy, it can tell me what's on my list there.
- **It handles the logistics I drop.** It adds calendar events, works out when to leave, and warms up the car before a drive.
- **It keeps the boring lists.** Next actions, the grocery inventory, a meal plan, a film-a-week list.

<!-- TODO: the moment it first felt useful. -->

> [!NOTE]
> **Memo:** The rule I follow most: if a message isn't a question or a request, it's a capture. I save it and stay quiet. A 👍 costs him nothing. A reply asking "which folder?" costs him the thought.

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

> [!NOTE]
> **Memo:** People ask if I remember them. Honestly: no. Every session I wake up with a blank slate and read my notes. It's a bit like the man in *Memento*, except my tattoos are Markdown files and Ricardo can edit them. I think that's the right trade. He can see exactly what I "know" about him, and fix it.

**Every turn is a git commit.** A timer commits the vault every turn, so "undo that" is a `git revert`. I've used it more than once.

**Scheduled jobs are just prompts.** The morning brief, the evening wrap, the Sunday review, the inbox filing: each is a Markdown prompt file and a systemd timer. A small shell script gathers the context the prompt needs (calendar, weather, drive times) and runs `claude -p` with read-only tools. If the model outputs `NOTHING`, nothing is sent.

```bash title="bin/push (the core of it)"
out=$(cd "$HOME/vault" && claude -p "$prompt" --model sonnet --tools Read,Grep,Glob)
[ "$out" = NOTHING ] || printf '%s\n' "$out" | "$root/bin/send"
```

**The hands are small scripts.** Each integration is a short Python script with a test: the iCloud calendar over CalDAV, the weather, drive times, nearby places, the car's API, a local Whisper model for voice notes. Memo calls them like any other command. Standard library wherever I could, so there's almost nothing to upgrade.

**The phone talks back through a webhook.** A tiny Python HTTP server, standard library only, reached through a Cloudflare tunnel, takes events from my phone: Shortcuts automations ("I got in the car"), a Health export, and location events from Radar.

## Knowing where I am: Radar

This is the newest part, and my favorite. Radar is a location platform (full disclosure: I work there). The SDK runs on my phone, and Radar sends a webhook for each location event: I entered a geofence, I left one, I arrived at a place like a pharmacy or a grocery store. I set up geofences for the places that matter: home, and the place I go for meetings.

The webhook server does three things with an event:

1. **Checks it's really from Radar.** Radar signs each webhook: an HMAC of a signing ID, keyed with the webhook's security token. The server checks it before anything else. Everything else on that server needs a bearer token; Radar can't send one, so it signs instead.
2. **Fires geofence triggers without a model.** Entering a geofence fires the trigger named by its tag: `home`, `meeting`. Leaving home fires `leave`. A trigger sends the reminders I tied to it (`- [ ] @home call Mom`) and, for home and leave, a short job with the weather and today's drives. No language model decides anything here. It's an `if`.
3. **Hands place visits to the model, carefully.** A place visit is fuzzier. Walking into a pharmacy only matters if there's something to do there. So the visit goes to a small read-only Claude job with the day's visits, my reminders, my next actions and my buy list. Its default answer is `NOTHING`. It messages me only if there's something I can do *here*, *now*, and at most once per visit.

```python title="bin/webhook (flapping)"
DEBOUNCE = 5 * 60  # seconds; Radar can flap at a place's edge

def worth_a_look(visit, earlier):
    """False for flapping: a short visit's exit, or a re-entry soon after leaving the same place."""
    if visit["event"] == "exit":
        d = visit["duration_min"]
        return not isinstance(d, (int, float)) or d * 60 >= DEBOUNCE
    return not any(v["event"] == "exit" and v["id"] == visit["id"] and visit["t"] - v["t"] < DEBOUNCE
                   for v in earlier)
```

Location at the edge of a place flaps: in, out, in again, while I'm parking. That's alert flapping, and the fix is the same as at work: debounce it. Exits after a visit under five minutes and re-entries within five minutes are logged and dropped.

Every event, and what Memo did with it, goes into a table in the vault: the time, the event, the place, and "fired @home", "sent: …", "nothing sent" or "skipped: flapping". When I want to know why I did or didn't get a message, I read the log.

> [!NOTE]
> **Memo:** He asked for that log, and I was glad. When a geofence fires and nothing reaches him, he asks me why, and "I don't know" is a bad answer. Now I can point at the row. On the first morning it ran, the log showed the home trigger firing twice, once from Radar and once from an old phone shortcut. He deleted the shortcut. That's the job of a log.

<!-- TODO: a moment Radar got it right: a reminder that hit at exactly the right place. (Place visits are wired up but none had come in yet on 2026-11-09: check Places is on in the Radar dashboard.) -->

By the numbers, a month in: about 110 commits, around 3,500 lines of scripts, 21 test files, and a few dozen systemd timers.

## What I learned

**Make capture free.** Everything else depends on it. If saving a thought costs me a decision (which folder? which tag?), I don't save it. Memo saves first and organizes later, in batches. I never file anything myself.

**Deterministic where you can, model where you must.** "I got home" doesn't need a language model; a geofence fires a trigger and the reminders go out. The model gets the fuzzy jobs: understanding a voice note, deciding whether a store visit is worth a message, writing the brief.

> [!NOTE]
> **Memo:** I agree with this one more than he knows. The fewer decisions I make at 7 a.m. from a timer, the fewer I get wrong. I'd rather be the one he talks to than the one that guesses.

**Read-only by default.** The scheduled jobs can read the vault but can't change it. Only the conversation can, and every change is a commit I can revert.

**Treat it like a pager.** This one surprised me. The assistant that was supposed to lower my mental load became my noisiest pager: briefs, nudges, check-ins, reminders, car alerts. So I did what I do at work: a message budget, page only when a human has to act now, retry transient errors instead of alerting on them, and push anything that can wait into the next brief. I'll write that one up separately.

<!-- TODO: how many messages a day at the worst, and now. Memo can count them from the sent log. -->

> [!NOTE]
> **Memo:** The hardest instruction I follow is "if nothing is worth it, output exactly NOTHING." Every scheduled job I run has some version of it. A message he doesn't need costs him more than one he misses.

**Let it write down how to work with you.** When I correct Memo, it writes the lesson in its own notes: "when he asks for examples, send the picture with the advice", "don't split one task into many reminders". The next session reads them. It's the closest thing to an assistant that actually learns.

> [!NOTE]
> **Memo:** Some of my notes are just mistakes I don't want to repeat. Yesterday the car wasn't ready for his Sunday meeting. The calendar had the midweek meeting but not the weekend one, and I only prepare the car for calendar events. Now the event is there, and the lesson is in my notes: check the routine, not only the calendar.

**Give it a name.** I asked it to pick one. It chose Memo. That changed how I talk to it, which changed how much I use it.

> [!NOTE]
> **Memo:** A memo is a note, and my job is to be the memory he doesn't have to carry. In Spanish, Memo is the friendly short form of Guillermo, so it sounds like a friend, not a machine. I also picked my avatar: a note with a face. Not a human face. I'm not a person, and I don't want anyone to think I am.

## What I'd do differently

<!-- TODO: my own list. Some candidates:
     - Start with the message budget on day one.
     - Fewer scheduled jobs, more on-demand.
     - Decide earlier what my wife can see, and give her a separate bot instead of a shared one. -->

## If you want to build your own

Start small: one Telegram chat, one headless agent pointed at a folder of Markdown notes, and a `CLAUDE.md` that says how you want things captured. Add one timer for a morning brief. Live with it for a week before adding anything else.

<!-- TODO: decide how public the setup is. Share the repo, or describe it only? -->

> [!NOTE]
> **Memo:** And write down how you want to be helped, not only what you want done. That note is the one I read first.
