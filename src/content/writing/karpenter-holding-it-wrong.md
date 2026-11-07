---
title: "Karpenter: you're holding it wrong"
dek: Most Karpenter complaints (too much churn, odd instance choices, surprise bills) trace back to the same handful of configuration mistakes.
date: 2026-11-06
tags: [kubernetes, aws, karpenter]
draft: true
---

<!-- DRAFT: outline with working prose. Links well with "Spot interruptions are a scheduling problem". -->

Karpenter does exactly what you tell it to. That's the problem. When a cluster churns nodes all afternoon, picks instance types nobody expected, or quietly doubles its bill, the cause is almost always in the NodePool or the pod specs, not in Karpenter. These are the mistakes I see most often.

## It packs on requests, not on usage

Karpenter chooses nodes from the resource requests of pending pods. If requests are missing, it packs too tightly and you get noisy neighbors and OOM kills. If requests are padded to three times real usage, it buys three times the nodes.

- Set requests from observed usage (p90 or so), and keep revisiting them.
- Memory limits equal to requests are a good default. CPU limits usually aren't.

## NodePools that are too narrow

Pinning a NodePool to two instance types throws away most of what Karpenter is good at. It can't find cheaper capacity, it can't bin-pack well, and on spot it concentrates your risk in a couple of capacity pools.

- Constrain on what the workload needs: architecture, category, generation, CPU range.
- Let everything that fits in.

## Consolidation without disruption budgets

Consolidation moves pods to cheaper or fewer nodes. Without PodDisruptionBudgets, it can evict every replica of a service at once. Then people turn consolidation off and wonder why the bill went up.

- Every service with more than one replica gets a PDB.
- Use NodePool disruption budgets to cap how many nodes can be disrupted at once, and to block disruption during business hours if you need to.

## `do-not-disrupt` everywhere

The `karpenter.sh/do-not-disrupt` annotation is meant for a job that can't be interrupted mid-run. Put it on long-running services and those nodes can never be consolidated or rotated. You end up with old AMIs and half-empty nodes that live forever.

## Forgetting nodes should expire

Nodes that live for months drift from your current AMI and config. Set `expireAfter` so nodes are replaced on a schedule, and let drift detection replace nodes when the EC2NodeClass changes. Both depend on the PDBs above being in place.

## No limits on the NodePool

A NodePool without `limits` will scale as far as pending pods ask it to. One bad HPA config or a crash-looping job with a huge request and you've launched a fleet.

## Running Karpenter on nodes it manages

If Karpenter's own pods run on Karpenter-managed nodes, consolidation or an interruption can take out the controller that's supposed to recover. Run it on a small managed node group or Fargate.

## Overlapping NodePools

<!-- TODO: example of two NodePools both matching a pod and the surprise it caused -->

When several NodePools can satisfy a pod, Karpenter uses `weight` to choose. Without explicit weights and clear taints or labels, which pool a pod lands on is hard to predict. Make each NodePool's purpose obvious from its requirements and taints.

## A checklist

- [ ] Requests set from real usage
- [ ] Broad NodePool requirements
- [ ] PDBs for every multi-replica service
- [ ] NodePool disruption budgets
- [ ] `expireAfter` set
- [ ] `limits` set on every NodePool
- [ ] Karpenter running on capacity it doesn't manage
- [ ] `do-not-disrupt` only on pods that truly need it
