---
title: Spot interruptions are a scheduling problem
dek: Two minutes is enough to move a pod if the cluster was built expecting to. Notes on running stateless production workloads on EC2 Spot with Karpenter.
date: 2026-10-28
updated: 2026-10-30
tags: [kubernetes, aws, reliability]
# Sample text written to show every feature of the post layout. Rewrite it in your own words or replace it, then remove draft.
draft: true
series:
  name: Running on spot
  part: 1
  next: Measuring what spot actually saves
revisions:
  - date: 2026-10-30
    note: Clarified which Kubernetes versions support the native sleep action.
  - date: 2026-10-28
    note: Published.
---

Most spot horror stories have the same shape. A node disappears, a few pods with no disruption budget go with it, the remaining replicas take the full load, and someone gets paged for a latency spike that resolves itself four minutes later. The postmortem blames spot. The real cause was a cluster that assumed nodes live forever.

EC2 gives you a two-minute warning before it reclaims a Spot instance. That is plenty of time to reschedule a stateless pod. Whether it is enough depends on what you did before the warning arrived. This is the checklist I use, in the order I apply it.

## The two-minute notice

When AWS needs the capacity back, it publishes a Spot Instance Interruption Warning to EventBridge and the instance metadata service, then reclaims the instance about 120 seconds later. Karpenter can consume these events from an SQS queue. With interruption handling on, it taints and drains the node as soon as the warning lands, and launches replacement capacity in parallel instead of waiting for pods to go Pending.[^queue]

<figure class="fig">
  <div class="scroll">
    <svg viewBox="0 0 680 236" role="img" aria-label="Timeline from 0 to 120 seconds. The old node drains from 0 to 65 seconds. A replacement node boots from 5 to 75 seconds, and pods become ready on it from 75 to 95 seconds. Between 65 and 95 seconds the surviving replicas carry the load. The instance is reclaimed at 120 seconds.">
      <g class="grid"><line x1="150" y1="18" x2="150" y2="190"/><line x1="275" y1="18" x2="275" y2="190"/><line x1="400" y1="18" x2="400" y2="190"/><line x1="525" y1="18" x2="525" y2="190"/></g>
      <rect class="gap" x="420.8" y="18" width="125" height="172"/>
      <text class="t gapt" x="483.3" y="176" text-anchor="middle">other replicas carry load</text>
      <text class="t" x="0" y="52">Drain old node</text>
      <rect class="bar" x="150" y="40" width="270.8" height="16" rx="2"/>
      <text class="t m" x="428" y="52">preStop + shutdown</text>
      <text class="t" x="0" y="92">Boot replacement</text>
      <rect class="bar b2" x="170.8" y="80" width="291.7" height="16" rx="2"/>
      <text class="t" x="0" y="132">Pods ready on it</text>
      <rect class="bar" x="462.5" y="120" width="83.3" height="16" rx="2"/>
      <line class="mark" x1="150" y1="14" x2="150" y2="196"/>
      <text class="t" x="150" y="10" text-anchor="middle">warning</text>
      <line class="end" x1="650" y1="14" x2="650" y2="196"/>
      <text class="t gapt" x="650" y="10" text-anchor="end">reclaimed</text>
      <line class="axis" x1="150" y1="196" x2="650" y2="196"/>
      <g class="t m" text-anchor="middle"><text x="150" y="216">0 s</text><text x="275" y="216">30</text><text x="400" y="216">60</text><text x="525" y="216">90</text><text x="650" y="216">120</text></g>
    </svg>
  </div>
  <figcaption><b>Figure 1</b>One interruption, to scale. Durations are illustrative, not measured. The shaded window is the time between the old pods leaving and the new ones becoming ready.</figcaption>
</figure>

Two things follow from that timeline. Replacement capacity takes time to boot, so there is usually a window where the surviving replicas carry the load alone. Size for it. And every pod on the node has to finish shutting down inside the notice, so a 300-second termination grace period is a promise you can't keep.

> [!NOTE]
> Interruption handling is off until you configure it. In the Karpenter Helm chart, set `settings.interruptionQueue` to the name of an SQS queue that your EventBridge rules feed.

## Diversify instance types

Interruption rates are per capacity pool: one instance type in one Availability Zone. The more pools a NodePool can draw from, the more likely the allocation strategy finds one with spare capacity, and the less likely a single reclaim event takes several of your nodes at once.

The common mistake is pinning instance types. Constrain on what the workload actually needs (architecture, generation, a size range) and let everything that fits in.

```yaml title="nodepool.yaml"
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: general-spot
spec:
  template:
    spec:
      nodeClassRef:
        group: karpenter.k8s.aws
        kind: EC2NodeClass
        name: default
      requirements:
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["spot", "on-demand"]
        - key: kubernetes.io/arch
          operator: In
          values: ["amd64", "arm64"]
        - key: karpenter.k8s.aws/instance-category
          operator: In
          values: ["c", "m", "r"]
        - key: karpenter.k8s.aws/instance-generation
          operator: Gt
          values: ["5"]
        - key: karpenter.k8s.aws/instance-cpu
          operator: In
          values: ["4", "8", "16", "32"]
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized
    consolidateAfter: 1m
```

Allowing `arm64` roughly doubles the pool count, but only if every image the pool might run is multi-arch. Check before you add it. Listing both capacity types lets Karpenter fall back to on-demand when no spot offering fits, instead of leaving pods Pending.[^fallback]

## Make the drain boring

A drain is only as graceful as the pods on the node. Three settings decide whether an interruption is invisible or a page.

| Setting | What it protects | Where I start |
| --- | --- | --- |
| `PodDisruptionBudget` | Pods leave one at a time while replacements come up elsewhere | `maxUnavailable: 1`, or 10–25% for large deployments |
| `preStop` sleep | The load balancer stops sending new requests before the process exits | 10–15 s, longer than the target's deregistration lag |
| `terminationGracePeriodSeconds` | Total time for the preStop hook plus graceful shutdown | Under 90 s, so it fits inside the notice |

A PodDisruptionBudget can't stop AWS from taking the instance back. What it does is pace the drain. Keep the budget loose enough that the drain finishes inside the window, or the last pods are killed instead of evicted.

```yaml title="deployment.yaml (excerpt)"
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: api
          lifecycle:
            preStop:
              sleep:
                seconds: 15
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels: { app: api }
        - maxSkew: 1
          topologyKey: karpenter.sh/capacity-type
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels: { app: api }
```

The native `sleep` action saves you from shipping a shell in the image just to wait.[^sleep] The second spread constraint is the one people skip, and it matters most in the next section.

## Keep an on-demand floor

Spot reclaims come in waves. When a pool gets tight, several instances in it go at once. Spreading replicas across capacity types means a wave can never take all of them. With `karpenter.sh/capacity-type` as a topology key and `maxSkew: 1`, Karpenter launches a mix of spot and on-demand nodes to satisfy the constraint.

For services where a cold start hurts, I add a small on-demand NodePool with a higher `weight`, sized to hold the minimum replica count. It costs a little. It also means the worst case is degraded, not down.

## What I watch

An interruption should show up on a dashboard, not in a page. These are the signals that tell me the setup is working:

- **Interruption events, as annotations.** Overlay them on the service's latency and error panels. If the lines don't move when an annotation appears, you're done.
- **Pending time after an interruption.** How long evicted pods wait for a node. If it grows, the NodePool is too narrow.
- **Fallback rate.** The share of nodes launched as on-demand. A rising rate means spot capacity in your pools is getting scarce, and your savings with it.

```bash
# Interruption warnings Karpenter acted on recently
kubectl get events -A --field-selector reason=SpotInterrupted

# Current nodes with capacity type and zone
kubectl get nodes -L karpenter.sh/capacity-type,topology.kubernetes.io/zone
```

## What stays off spot

Anything that can't lose its node in two minutes: StatefulSets without fast replica promotion, long batch jobs without checkpoints, and the cluster's own controllers. Karpenter itself should run on capacity it doesn't manage, such as a small managed node group or Fargate. Otherwise an interruption can take out the thing that handles interruptions.

None of this is specific to spot. Nodes fail for plenty of reasons, and a cluster that handles a two-minute warning gracefully handles a kernel panic better too. Spot just makes you prove it every week.

Part 2 covers the cost side: how to measure what spot is actually saving once you count the on-demand fallback and the extra headroom.

[^queue]: The same queue also carries scheduled maintenance events and instance state changes, which Karpenter handles the same way: cordon, drain, replace.

[^fallback]: When a NodePool allows both, Karpenter prefers spot and uses on-demand only when no spot offering satisfies the pod's requirements.

[^sleep]: The `sleep` lifecycle action is on by default from Kubernetes 1.30. On older clusters, use an `exec` hook that runs `sleep` from the image.
