---
title: Push vs. pull GitOps, and why it matters
dek: Both put Git in charge of what runs. They differ in who holds the keys, who notices drift, and what breaks when the pipeline does.
date: 2026-11-06
tags: [kubernetes, gitops, platform]
draft: true
---

<!-- DRAFT: outline with working prose. Replace the bracketed notes with your own examples. -->

Every team that deploys from Git says they do GitOps. Ask one more question, *what actually applies the change to the cluster?*, and you get two very different answers. In one, a CI job runs `kubectl apply` or `helm upgrade` after a merge. In the other, an agent inside the cluster watches the repo and pulls changes in on its own. The first is push. The second is pull. They look the same in a demo and behave very differently on a bad day.

## The two models

**Push.** A merge triggers a pipeline. The pipeline has credentials for the cluster and applies the manifests. The cluster does nothing until the pipeline tells it to.

**Pull.** An agent such as Argo CD or Flux runs in the cluster, polls Git (or gets a webhook), compares desired state to live state, and reconciles the difference. CI's job ends at building the image and updating the repo.

<!-- TODO: small diagram: Git → CI → cluster vs. Git ← agent-in-cluster -->

## Who holds the keys

This is the difference that matters most to me. In the push model, your CI system holds credentials that can change production, usually broad ones, for every cluster it deploys to. CI runners are some of the most exposed machines you own: they run third-party actions, pull arbitrary dependencies and execute code from every branch.

In the pull model, nothing outside the cluster needs write access to it. The agent needs read access to Git and to the registry. The blast radius of a compromised pipeline shrinks to "can open a commit," which still goes through review.

## Who notices drift

A push pipeline applies state once and walks away. If someone `kubectl edit`s a Deployment at 2 a.m. to stop the bleeding, that change lives until the next deploy quietly overwrites it, or forever if nobody deploys that service again.

A pull agent compares continuously. It can show drift, alert on it, or revert it. Which of those you want is a real decision (self-heal on everything is a great way to fight your own incident response), but at least you get to make it.

## What breaks when CI breaks

- Push: CI down means no deploys and no rollbacks. Your rollback path depends on the same system that may be the problem.
- Pull: CI down means no new images. A rollback is a `git revert`, and the cluster picks it up without CI.

## Where push is still the right call

Pull isn't free. Be honest about the costs:

- **Feedback.** "Merged" is not "deployed." You need health status flowing back to the PR or the chat channel, or people will assume.
- **Ordering.** Migrations, then app, then smoke test is natural in a pipeline and awkward in a reconciler (sync waves and hooks help, but they're a new thing to learn).
- **Bootstrap.** Something has to install the agent. That something is usually push.
- **Small setups.** One cluster, one team, short-lived credentials via OIDC: push with a scoped role can be perfectly reasonable.

<!-- TODO: what you run at work and why. Keep it concrete. -->

## How I'd choose

- Many clusters, or clusters in private networks: pull.
- Strict separation between "who can merge" and "who can touch prod": pull.
- Need drift visibility for audits: pull.
- A single cluster and a pipeline that already works, with short-lived scoped credentials: push is fine. Revisit when either of those changes.

Most mature setups end up hybrid: push for the bootstrap and the infrastructure underneath, pull for everything that runs on the cluster.
