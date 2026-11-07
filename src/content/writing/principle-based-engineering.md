---
title: Principle-based engineering
dek: Rules tell people what to do in the cases you thought of. Principles help them decide in the ones you didn't. How to write principles that settle real arguments, and how to keep them from turning into posters.
date: 2026-11-07
tags: [platform, engineering, leadership]
draft: true
---

<!-- DRAFT: outline with working prose. Replace the TODO notes with your own principles and stories. -->

Every engineering org runs on decisions nobody wrote down. Which database for the new service? Do we build it or buy it? Is this outage worth a postmortem? Should this team own its own cluster? Most of these get settled by whoever is senior and in the room, and the reasoning leaves with them.

You can fight that with rules: a standards doc, a review checklist, an approved-tools list. Rules work until the first case they didn't expect, and then people either follow them into a bad outcome or work around them and stop trusting the rest. Principles are the other option. They don't say what to do. They say what we care about when two good things pull in different directions, so people can make the call themselves and get roughly the same answer the team would have.

## Rules, principles and values

These get mixed up, so it's worth being precise:

- **Values** are what you care about: reliability, speed, simplicity. Everyone shares them, which is why they don't help you decide anything.
- **Principles** say which value wins when they conflict, and roughly when. "We prefer boring technology over the best tool for the job" picks a side.
- **Rules** are decisions already made: "Services run on EKS." "Every alert has a runbook." Fast to follow, and useless outside the case they were written for.

A healthy org has a few values, a short list of principles, and rules that each trace back to a principle. When a rule stops making sense, the principle tells you whether to change it or keep it.

## What a good principle looks like

The test I use: **could a reasonable team choose the opposite?** If not, it's a value wearing a principle's clothes.

"Security is our top priority" fails the test. No team chooses the opposite, and it doesn't help you decide whether to ship on Friday with a known medium CVE. "We ship with known low-risk issues and fix them in the open, rather than holding releases" passes. Plenty of teams hold the release, and that's a reasonable choice too.

Good principles tend to:

- **Name the trade-off.** "X over Y", where Y is something you'd also like to have.
- **Say why.** One or two sentences on the reasoning, so people can tell when it doesn't apply.
- **Be short enough to quote** in a design review without opening a doc.
- **Come from scars.** The best ones are what you learned the hard way, written down so the next team doesn't have to.

## Some I've used

These are from platform work. Yours will be different, and they should be.

**Paved roads, not gates.** We make the right way the easiest way, and we don't block the other ways. Teams can step off the road, but they own what they find there. *The trade-off:* we give up some consistency so we don't become the bottleneck.

**Pull over push.** Systems reconcile toward state in Git; pipelines don't reach into production. *The trade-off:* we give up some deploy speed and simplicity in exchange for a smaller blast radius and drift we can see. (I wrote about this in "Push vs. pull GitOps".)

**Boring by default.** New technology has to beat the thing we already run by a wide margin, not just be better. *The trade-off:* we sometimes run the second-best tool, and we keep our on-call load small.

**Measure where the user is.** SLOs are measured at the edge, per request, not from inside the service. *The trade-off:* it costs more to instrument, and the numbers look worse. (This is half of why "When the ALB stops cutting it" exists.)

**Reversible decisions fast, irreversible ones slow.** Most choices can be undone. We make those quickly, close to the work. For the few that can't (data models, public APIs, vendor contracts), we write it down and wait a week.

<!-- TODO: replace or add to these with your own, ideally each with a short story of where it came from -->

## Using them

A principle nobody cites is decoration. The places they earn their keep:

- **Design reviews.** Reviewers argue from principles instead of preferences. "This adds a gate where we could pave a road" is a better review comment than "I don't like it".
- **Decision records.** Every ADR says which principles it leans on, and which it goes against and why. Going against one is allowed; doing it silently isn't.
- **Onboarding.** New engineers learn how the team thinks in an afternoon, instead of over a year of watching who wins arguments.
- **Saying no.** "We're boring by default" is an easier no to give, and to take, than "I don't think we should use that".

<!-- TODO: an example of a review or decision a principle settled -->

## How it goes wrong

- **Too many.** Past seven or so, nobody remembers them, and you can find one to justify anything. Keep the list short enough to recite.
- **Platitudes.** "Customer first", "quality matters". They fail the opposite test, and people learn to skip the whole list.
- **Principles as rules.** Someone quotes a principle to end the discussion instead of to frame it. A principle says what we weigh, not who wins.
- **Never revisited.** The context that made a principle right changes: the team doubles, the product moves, the cloud bill becomes the problem. Review the list once a year, and retire what's stopped being true.
- **Written by one person.** Principles handed down get followed to the letter and no further. Write them with the people who'll use them, from decisions you've already made together.

## Starting

You don't need a workshop. Take the last five decisions that caused an argument. For each, write one sentence about what you ended up valuing over what. You'll find the same trade-off coming up more than once. That repeat is your first principle.

Write it down, put it where design reviews happen, and see whether people start quoting it. If they do, write the next one. If they don't, it wasn't the principle you actually work by. Find that one instead.

<!-- TODO: closing line, maybe link to the team's actual principles doc if it's public -->
