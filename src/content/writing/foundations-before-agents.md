---
title: Agents amplify your foundations, good or bad
dek: Coding agents can do real work in your codebase and your platform, but they magnify whatever is already there. Why every boring foundation I've written about turns out to be what makes it safe to let agents loose.
date: 2026-11-07
tags: [ai, platform, engineering]
draft: true
---

<!-- DRAFT: outline with working prose. This is the hub post: it links every other post on the site. Several linked posts are still drafts, so publish this one last, or check that every link resolves. -->

Every team is asking the same question now: how much can we let coding agents do? Write the code? Open the pull requests? Merge them? Run the deploy? Answer the page?

The honest answer is that it depends less on the agent than on what you're letting it into. An agent is a very fast, very confident engineer with no memory of your last outage. It does what your systems allow and what your context tells it. Put it in a codebase with good tests, clear ownership and a delivery pipeline that catches mistakes, and it's the best hire you'll make this year. Put it in a codebase held together by tribal knowledge and someone's laptop, and it will find every crack, faster than any person could.

**Agents amplify your foundations.** Good ones make agents safe and fast. Weak ones make them dangerous at scale.

Most of what I've written here is about those foundations, and none of it was about AI when I wrote it. Read again with agents in mind, each post answers the same question: what has to be true before you let an agent do this?

## Principles are context

An agent can't ask the senior engineer in the room why we don't do it that way. It only knows what's written down.

That's what [Principle-based engineering](/writing/principle-based-engineering/) is about, and it matters more with agents. Rules cover the cases you thought of. Agents spend all day in the ones you didn't. A short list of principles that say what we trade for what (paved roads over gates, boring by default, reversible decisions fast) is exactly the context an agent needs to make the call the team would have made.

- Put your principles in the files agents read: `AGENTS.md`, `CLAUDE.md`, the repo's contributing guide.
- Write them as trade-offs, not slogans. "Security first" tells an agent nothing. "We prefer a managed service over running our own, even at higher cost" tells it what to propose.
- When an agent makes a choice you don't like, check whether a principle would have prevented it. If so, write it down. That's the same loop that works for people.

## The factory is the guardrail

Agents don't just write more code. They write it faster than people can review it. All of that goes through [the software factory you already have](/writing/you-already-have-a-software-factory/), designed or not.

If the factory is accidental, agents make it worse: more pipelines nobody understands, more dependencies pulled from wherever, more changes nobody can trace. If it's designed, every station becomes a check the agent can't skip:

- **Dependencies** come through one proxy, so an agent can't add a package you've blocked, or one that's a typo of a real one.
- **Builds** are hermetic, on runners with no standing credentials, so an agent's code can't reach anything during the build.
- **Verify** runs the same tests, scans and policies on agent changes as on anyone else's. No exemptions for the bot.
- **Provenance** records which changes came from an agent, which agent, with which instructions. When something breaks, you can trace it.

The factory's lead time also tells you whether agents are helping. If they write code in minutes and it waits days for review, the bottleneck has moved, and that's the station to fix next.

## Agents get pull requests, not production keys

The single most important rule for agents in a platform: **they change Git, never production directly.** That's the case I made in [Push vs. pull GitOps](/writing/push-vs-pull-gitops/) for CI systems, and it applies even more to agents.

- With pull-based GitOps, nothing outside the cluster needs write access to it. The agent opens a pull request; the reconciler applies what's merged. An agent with no production credentials can't be tricked into using them.
- Drift is visible and gets reverted. If an agent (or a person helped by one) runs `kubectl edit` in a hurry, the reconciler puts it back and someone sees why.
- Rollback is `git revert`. Undoing an agent's change works the same as undoing anyone's.

## Clear boundaries make agent changes predictable

Agents do best with tools that have one clear job. [Don't use Terraform to manage what runs on Kubernetes](/writing/terraform-and-kubernetes/) is about drawing that line: Terraform builds the cluster, a reconciler runs what's inside it.

With that line in place, an agent changing an app knows where to look, and a bad change is caught by a reconcile loop rather than a `terraform apply` that deletes something on the way. Without it, an agent asked to bump a replica count can produce a plan that recreates a namespace, and a tired reviewer approves it.

- Keep each kind of change in one place, with one tool. Agents follow existing patterns; make sure there's only one to follow.
- Make plans and diffs readable, and require a human to read the risky ones. Destroys and replacements should never be approved in bulk.

## Distributed systems principles become review checks

Agents write a lot of code that calls other services, and it usually looks fine. The bugs are the ones in [Principles for distributed systems](/writing/principles-for-distributed-systems/): a missing timeout, a retry loop with no jitter, a write that isn't safe to repeat, an unbounded queue. They pass every unit test and fail under load.

- Turn the principles into checks the factory runs: lint for HTTP clients without timeouts, for retries without backoff, for list endpoints without page limits.
- Put them in the review checklist, and in the context agents read. An agent told "every call has a timeout shorter than its caller's" will write one.
- Idempotency matters twice: agents retry too. An agent that re-runs a migration or a script after a timeout needs it to be safe to run twice.

## The platform limits the blast radius

Sooner or later an agent will ship something wrong. The platform decides how far it spreads.

[Karpenter: you're holding it wrong](/writing/karpenter-holding-it-wrong/) and [Spot interruptions are a scheduling problem](/writing/spot-interruptions/) look like cost and capacity posts. With agents, they're blast-radius posts:

- **Resource requests and NodePool `limits`** mean an agent's Deployment with a typo'd replica count can't launch a fleet.
- **PodDisruptionBudgets** mean an agent's rollout can't take every replica down at once.
- **Workloads that survive interruption** survive bad rollouts too. If your pods drain cleanly in two minutes for spot, a broken version gets replaced cleanly as well.
- **Gradual rollouts**, by cell or zone, mean an agent's mistake hits a slice, not everyone.

## Write down what pages you at 2 a.m.

[MongoDB issues that bite you at 2:00 a.m.](/writing/mongodb-at-2am/) is a list of things that work fine until they don't: a new query path that scans a whole collection, documents that grow forever, a batch delete that floods the oplog. These are exactly the mistakes an agent makes, because nothing in the code tells it they're mistakes.

- Write that 2 a.m. knowledge down where agents read it: "every new query needs an index; check with `explain()`".
- Catch it in the factory: run with `notablescan` in test environments, and check for new query shapes in review.
- Alert on the symptoms, as in that post, so what slips through is caught in minutes, not at the next outage.

## You can't trust what you can't measure

The most important foundation is knowing, quickly, whether a change made things worse. [When the ALB stops cutting it](/writing/when-alb-stops-cutting-it/) spends a long section on per-request SLOs, and this is why.

When agents ship more changes, more often, you need the system to judge them, not a person watching dashboards:

- Per-route SLOs, with burn-rate alerts measured where users are.
- Canaries that compare the new version against the old on real traffic, and roll back on their own.
- Errors from every layer counted in one place, including the load balancer's.

Without that, every agent change is a guess, and the only safe speed is slow.

## Then let agents into operations

Once all of that is in place, agents can help run the system too, not just change it. [How to build an AI triage skill](/writing/ai-triage-skills/) is the first step: a read-only agent that works out the service, the scope and the likely cause, cites its evidence, and leaves the decision to a person.

It only works because of everything above it: written runbooks and principles to read, deploy history from the factory, Git as the record of every change, and per-request signals to check its claims against.

## How far to let agents go

Don't decide once. Decide per area, based on how strong the foundations are there.

| Level | Agents can | Only if |
| --- | --- | --- |
| 0. Suggest | Answer questions, draft code for a person to apply | Always fine |
| 1. Propose | Open pull requests in a sandbox | Principles in the repo, tests that run on every PR, no production credentials anywhere the agent runs |
| 2. Merge low-risk | Merge some changes (deps, docs, config) after checks pass | A designed factory with provenance, GitOps delivery, PDBs and limits, per-route SLOs |
| 3. Ship | Merge and roll out code changes | Automated canaries with rollback, cell-based rollouts, strong review of agent output on a sample basis |
| 4. Operate | Triage, and take specific reversible actions | Everything above, plus a triage skill with evals and an approval that means something |

Most teams should be at level 1 or 2 in most of their codebase. A few well-tested services can go further. Some areas (data migrations, auth, billing) may never go past 1, and that's fine.

## Where to start

- [ ] Pick one service you'd like agents to work on.
- [ ] For each foundation above, score it honestly: missing, partial, or solid.
- [ ] Fix the weakest one first. It's where an agent will find trouble.
- [ ] Write your principles and 2 a.m. lessons into the repo, where agents read them.
- [ ] Start agents at level 1, with no production access, and measure.
- [ ] Move up a level only when the foundations for it are solid.

None of this is new work. It's the work that good platform teams were already doing. Agents just make it urgent, because they find out how good your foundations really are, very quickly.

<!-- TODO: closing line, and a real example of an agent finding a weak foundation -->
