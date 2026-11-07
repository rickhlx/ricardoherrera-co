---
title: You already have a software factory, whether you like it or not
dek: Every team that ships code has a path from commit to production. The only question is whether anyone designed it. How to find the factory you already run, and how to start running it on purpose.
date: 2026-11-07
tags: [platform, ci-cd, supply-chain]
draft: true
---

<!-- DRAFT: outline with working prose. Replace the TODO notes with your own examples. Links well with "Principle-based engineering" and "Push vs. pull GitOps". -->

"Software factory" sounds like something big organizations buy: a program with a name, a budget, and a slide with conveyor belts on it. Most teams hear it and think *not for us, we just have some pipelines.*

But if you ship code, you have a factory. Code goes in one end, running software comes out the other, and in between there's a series of steps that build, test, package, store, sign (or not), promote and deploy it. Someone set up each of those steps at some point, for some reason. Together they decide how fast you ship, how safely, and what you can prove about what's running in production.

The question isn't whether to build a software factory. It's whether you'll keep running the one you have by accident.

## The factory you didn't design

Walk the path a commit takes to production and write down every step. In most orgs I've seen, it looks something like this:

- Three CI systems, because each was the right choice when a team picked it.
- Fourteen copies of a pipeline template, each a little different, none of them the original.
- Base images pulled from a public registry by tag, so nobody knows exactly what's in them.
- Dependencies fetched straight from the internet at build time, every time.
- A Jenkins server that only one person knows how to upgrade, and they're on vacation.
- Secrets in CI variables, copied between projects by hand.
- Deploys from a laptop "just this once", two years ago, still.
- No record of which commit, which build and which base image produced the container running in production right now.

<!-- TODO: your own inventory from a real org, numbers if you have them -->

None of these was a bad decision when it was made. Together, they're a factory nobody designed, and you're running it anyway.

## Why it matters now

For a long time, an accidental factory was mostly a speed problem. Builds were slow and flaky, and people complained. Three things have made it a bigger problem.

**Supply chain attacks go after the factory.** Attackers stopped going only after production and started going after how software gets built: a compromised dependency, a poisoned build tool, a CI runner with credentials to everything. If your factory is accidental, you can't say which of those you're exposed to.

**Customers and regulators ask what's in the box.** SBOMs, signed artifacts, build provenance and secure development attestations are becoming things you're asked for in contracts and audits, not nice-to-haves. You can't produce provenance for a build nobody can describe.

<!-- TODO: check the current state of the regulations you want to name (US secure software attestation, EU Cyber Resilience Act) before publishing -->

**AI writes more of the code.** The amount of code going into the factory is going up fast. Review, test, scan and deploy are the stations that now decide whether that turns into more shipped software or a bigger pile of risk.

## Stations, not pipelines

The factory metaphor is useful because it makes you look at stations, not pipelines. A pipeline is one team's script. A station is a step every piece of software passes through, and it has a job, an owner, an input and an output.

| Station | Its job | What a designed one gives you |
| --- | --- | --- |
| Source | Every change is reviewed and traceable | Branch protection, required reviews, signed commits where it matters |
| Dependencies | Know and control what comes in | A proxy or mirror, pinned versions, a way to block a bad package everywhere at once |
| Build | Turn source into an artifact, the same way every time | Hermetic, reproducible builds on runners with no standing credentials |
| Base images | Know what everything is built on | A small set of maintained images, rebuilt on a schedule |
| Verify | Tests, scans and policy | One set of checks every service gets, with clear owners for exceptions |
| Artifacts | One place where builds live | A registry with immutable tags, SBOMs and signatures attached |
| Provenance | Prove where an artifact came from | Signed build attestations linking commit, build and artifact |
| Promote and deploy | Get artifacts to environments safely | Pull-based delivery, the same artifact promoted, never rebuilt |
| Observe | Know what's running and how it's doing | Every running workload traceable back to its commit |

You don't need every station to be great. You need each one to exist on purpose, with someone who owns it.

## Running it on purpose

### Map it first

Before changing anything, draw the factory you have. Follow three real services from commit to production and write down every tool, every credential and every manual step. It's usually a humbling afternoon, and the most useful one you'll spend.

### Measure it like a factory

Factories care about throughput and defects. So should you:

- **Lead time** from commit to production, and how it splits across stations. Usually one station (review, a slow test suite, a manual approval) is most of it.
- **Change failure rate** and **time to restore**. The DORA metrics are a good place to start because they measure the factory, not the people in it.
- **Coverage.** What share of what's running in production went through the designed path? This is the number that tells you if the factory is real.

<!-- TODO: before/after numbers from a factory you've worked on -->

### Standardize the parts that should be the same

Not everything needs to be uniform. Teams can choose their language, their test framework and their deploy cadence. But some stations work only when they're shared:

- One way to fetch dependencies, so you can block a bad package once.
- One artifact registry, so you can answer "where is this running?"
- One way to sign and attest builds, so provenance means the same thing everywhere.
- One way to deploy to production, so you know who and what can change it.

### Make the designed path the easy path

If the designed factory is harder to use than the accidental one, people will keep using the accidental one. Start with templates that work out of the box, keep the escape hatches, and own what's on the paved road so teams don't have to. ("Paved roads, not gates" is in "Principle-based engineering" for this reason.)

### Treat it as a product

The factory has users: every engineer who ships. Give it an owner, a roadmap and a way to collect complaints. Measure adoption, not mandates. A factory nobody chooses to use is just another accidental one, with a nicer name.

## Where to start on Monday

- [ ] Follow one service from commit to production and write down every step.
- [ ] Find out which commit is running in production for that service, and how long it took you to find out.
- [ ] Count your CI systems, pipeline templates and base images.
- [ ] List every credential that can change production, and where it lives.
- [ ] Pick the one station that hurts most, give it an owner, and fix that.

You already have a software factory. Now you know where it is.

<!-- TODO: closing story: the moment you realized the factory you were running was an accident -->
