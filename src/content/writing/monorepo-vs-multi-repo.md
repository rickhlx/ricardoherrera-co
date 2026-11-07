---
title: "Monorepo or multi-repo? It depends. Here's on what."
dek: '"It depends" is the right answer, and a useless one unless you say what it depends on. The trade-offs behind the repo question, and how to turn them into principles your team can actually decide with.'
date: 2026-11-07
tags: [platform, engineering, ci-cd]
draft: true
---

<!-- DRAFT: outline with working prose. Replace the TODO notes with your own examples. Builds on "Principle-based engineering". -->

Ask ten engineers whether you should use a monorepo, and you'll get ten confident answers, five each way. Ask a senior one, and you'll get "it depends."

That answer has a bad reputation, because it's usually where the conversation ends. But it's the right answer. The mistake is stopping there. "It depends" is only useful if you say **on what**, and which way your team leans when those things pull against each other.

That's what I mean by [principle-based engineering](/writing/principle-based-engineering/): a principle names a trade-off and picks a side, so people can decide without re-arguing it every time. The repo question is a good test, because nearly every argument for one side is an argument against something the other side cares about.

## What it actually depends on

### How often things change together

This is the biggest one. If a change to a shared library usually means changing the five services that use it, a monorepo lets that be one commit, one review, one CI run. In separate repos, it's a release of the library, then five pull requests, landed in the right order, with a window where some services are on the old version and some on the new.

If your services really are independent, rarely sharing more than an API contract, that cost almost never comes up, and separate repos cost you nothing here.

*Ask:* in the last quarter, how many changes touched more than one repo, or would have, in a monorepo?

### Whether you want one version of everything

A monorepo nudges you toward one version of each dependency, everywhere. That's great for security patches (upgrade once, every service gets it) and painful for teams who need to move at a different pace than everyone else.

Separate repos let each service pin its own versions. That's freedom until a vulnerable library is in forty repos at twelve versions, and someone has to chase them all.

*Ask:* when a critical CVE lands, how long does it take you to patch everything today?

### How much you'll invest in tooling

A monorepo doesn't scale on default tools. Past a certain size you need a build system that knows what changed and builds and tests only that (Bazel, Nx, Turborepo, Pants), CI that runs per-directory, code owners per path, and a checkout that doesn't download the whole world. Big companies run huge monorepos because they have teams whose whole job is making that work.

Separate repos scale on default tools for longer: each repo's CI is small and simple. The cost shows up elsewhere, in the dozens of copies of pipelines, configs and templates that drift apart. (That's the accidental factory from [You already have a software factory](/writing/you-already-have-a-software-factory/).)

*Ask:* who on your team will own the build system? If the answer is nobody, that's an answer.

### Who owns what, and how strictly

Separate repos make ownership obvious: one repo, one team, its own permissions and its own rules. A monorepo needs that drawn in, with code owners, directory conventions and review rules, and it's easier for a well-meaning change to wander into someone else's code.

That's a feature for some teams. In a monorepo, anyone can fix the bug in the library they depend on, in the same pull request. In separate repos, they file an issue and wait.

*Ask:* do you want teams to be able to change each other's code, with review, or not?

### How you release

If everything ships together, or on the same train, a monorepo matches. If every service deploys on its own schedule, a monorepo still works, but you'll need per-service build and release logic, and the "one commit, everything consistent" promise gets weaker at deploy time anyway.

*Ask:* when one service ships, does anything else need to ship with it?

### Who else needs access

Contractors, partners, open-source pieces, code under a different compliance regime. Separate repos give you access control and history per repo for free. In a monorepo, anything that has to be kept apart usually ends up outside it anyway.

## Turning it into principles

Lists of trade-offs don't help much on their own. What helps is deciding, once, which way you lean. A few principles I've seen work, and the side each picks:

**Code that changes together lives together.** If two things usually change in the same pull request, they belong in the same repo. Not "all code in one repo," and not "one repo per service," but repo boundaries that follow change boundaries. *What it costs:* you'll occasionally move code between repos as boundaries shift.

**One version of shared dependencies, unless a team asks for an exception.** Security and consistency win by default. Teams can opt out, in writing, and own the cost. *What it costs:* some teams upgrade before they'd like to.

**Don't take on a monorepo without an owner for the build.** No build system owner, no monorepo. Otherwise you get the costs of a monorepo (slow CI, flaky builds) without the benefits. *What it costs:* you may stay multi-repo longer than you'd like.

**Deployment config lives apart from application code.** Whatever you choose for code, the desired state of your clusters lives in its own repo, so the reconciler watches one place and access to production is decided in one place. (See [Push vs. pull GitOps](/writing/push-vs-pull-gitops/).) *What it costs:* a two-step change for "new code and new config."

<!-- TODO: which of these your team used, and one you'd add -->

## Most teams end up in between

The answer is rarely all one or all the other. What I see work most often:

- **A monorepo per domain or product.** Checkout, its services, its shared libraries and its tests in one repo. Search in another. Boundaries follow how teams and changes are organized.
- **Shared platform libraries in one place**, published as versioned packages, with automated upgrade pull requests into the repos that use them.
- **A separate repo for deployment config**, watched by the GitOps reconciler.
- **Templates for new repos** that come with the factory built in (CI, code owners, scanning), so many repos don't mean many different pipelines.

## A note on agents

Coding agents change the trade-off a little, mostly in the monorepo's favor, but only if the foundations are there (see [Built on sand, built on rock](/writing/foundations-before-agents/)).

- **Context.** An agent in a monorepo can see the library, its callers and their tests, and make a change across all of them in one pull request. In separate repos, it has to be pointed at each one.
- **Size.** A big monorepo is too much to read. Agents need the same help people do: a short `AGENTS.md` at the root, more specific ones per directory, and a build that tells them what their change affects.
- **Blast radius.** A cross-cutting agent change in a monorepo can touch a hundred services in one pull request. Code owners, per-path CI and a review rule for wide changes matter more, not less.

None of that settles the question on its own. It's one more thing your answer depends on.

## How I'd decide

Write down your answers to the questions above, then pick:

| If most of these are true | Lean toward |
| --- | --- |
| Changes often span several services; you want one version of dependencies; someone will own the build; teams are fine changing each other's code with review | Monorepo, at least per domain |
| Services change independently; teams release on their own schedules; you need strict access boundaries; nobody will own a build system | Multi-repo, with shared templates |
| A mix, which is most teams | Repos that follow change boundaries, plus a separate config repo |

Then write the principle down, with what it costs, so the next time someone asks, the answer isn't "it depends." It's "it depends, and here's what we decided it depends on."

<!-- TODO: closing line from your own experience: a repo split or merge that went well or badly -->
