---
title: When the ALB stops cutting it
dek: An ALB per service is the right place to start on EKS. Here's how to tell when you've outgrown it, and what you take on when you put a reverse proxy inside the cluster.
date: 2026-11-07
tags: [kubernetes, aws, networking, platform]
draft: true
---

<!-- DRAFT: outline with working prose. Replace the TODO notes with your own examples and numbers. Links well with "Push vs. pull GitOps". -->

On EKS, the AWS Load Balancer Controller makes the first answer easy. Write an Ingress, get an ALB. TLS comes from ACM, WAF attaches with one annotation, and AWS keeps the thing running. For the first handful of services, that's the right call, and I'd still tell most teams to start there.

Then the cluster grows. There are forty Ingresses, a dozen ALBs, and a spreadsheet of which annotation does what. Deploys throw 502s now and then, and someone asks for a feature the ALB doesn't have. That's when a reverse proxy inside the cluster starts to look good. This post covers how to tell you've reached that point, and what you take on when you cross it.

## What the ALB is good at

It's worth being clear about what you'd be giving up:

- **Nobody runs it.** No pods to scale, no proxy to patch, no on-call for the data plane.
- **TLS from ACM.** Certificates renew themselves, and the private keys never touch the cluster.
- **WAF, Shield and OIDC auth** attach at the edge, before traffic reaches anything you run.
- **It sends traffic straight to pods** with `target-type: ip`. There's no extra hop.

If that covers what you need, stop reading. An in-cluster proxy is not an upgrade by default. It's a trade.

## Signs you've outgrown it

### You're paying for a pile of ALBs

Every Ingress without an `alb.ingress.kubernetes.io/group.name` gets its own load balancer, and each one bills by the hour before it serves a single request. Ingress groups help, but they bring their own trouble. Every team's Ingress now edits a shared ALB, rule order is decided by `group.order`, and one bad annotation can break the reconcile for the whole group.

<!-- TODO: real numbers, e.g. "N ALBs at $X/month before LCUs, for services doing Y rps" -->

### You're running into quotas

An ALB looks limitless until you put a whole cluster behind one. These are the default quotas that tend to come up on EKS:

| Quota | Default | What runs into it |
| --- | --- | --- |
| Rules per ALB (not counting default rules) | 100 | Every host and path in an ingress group becomes a rule. |
| Conditions, values and wildcards per rule | 5 each | Ingresses with many hostnames or paths in one rule. |
| Certificates per ALB (not counting the default) | 25 | Tenants on their own domains. |
| Target groups per ALB | 100 | One target group per Service port, for every Ingress in the group. |
| Targets per ALB | 1,000 | Pods in IP mode, or nodes in instance mode, counted across all target groups. |
| Targets per target group | 1,000 | One big Deployment in IP mode. |
| Target groups per forward action | 5 | Weighted canaries across several versions. |

You won't hit any of these with ten services. A shared ALB for a hundred services hits the rule limit. A few big Deployments in IP mode hit the target limit. Tenants on their own domains hit the certificate limit. Several of these can be raised, but each increase is a support ticket, and the next limit is waiting behind it. That's when people start splitting groups by hand.

The target limits deserve a second look, because the count depends on the target type:

- **Instance mode** registers every node in the cluster against every target group, and traffic goes through a NodePort and kube-proxy. With Karpenter adding and removing nodes all day, the target groups are always changing, and every node is a target for every service, whether it runs that service's pods or not.
- **IP mode** registers pods. That's the better default, but now the limit counts replicas. A Deployment that scales to 600 pods during a spike uses 600 of the 1,000 targets the whole ALB is allowed.

> [!NOTE]
> These are the defaults at the time of writing. Check the Elastic Load Balancing quotas page, or Service Quotas in your account, before you plan around them. They change, and several can be raised on request.

<!-- TODO: verify every number in the table against the quotas page before publishing -->

### Traffic spikes

An ALB isn't one box. AWS runs it as a fleet of nodes and adds more as traffic grows. That scaling is fast for traffic that ramps up, and slower for a step change: a launch, a push notification to every user, a retry storm after an outage. Until it catches up, you see more latency, and sometimes 5xx errors that come from the ALB itself, not from your pods. In CloudWatch that's `HTTPCode_ELB_5XX_Count` going up while `HTTPCode_Target_5XX_Count` stays flat.

There are ways to deal with it:

- **LCU reservation.** You can reserve a minimum capacity for a load balancer ahead of a known event. It works, but you pay for the reserved capacity whether you use it or not, and you have to know the spike is coming.
- **Pre-warming through AWS Support.** The older route, still around for some cases. Slow, and it needs a ticket.

Neither helps with the spike you didn't see coming.

The ALB also uses IP addresses from your subnets, one per ALB node, and it needs more of them as it scales. On EKS with the VPC CNI, pods use the same subnets. If those subnets are nearly full, the ALB can't scale out in the middle of a spike, at exactly the moment it needs to. AWS asks for at least a `/27` with eight free addresses per subnet. Give it a lot more than that.

<!-- TODO: graph from a real spike: ELB 5XX vs target 5XX, and the LCU curve -->

Your side of the spike has its own lag. The HPA adds pods, and in IP mode each new pod has to register with the target group and pass health checks before it gets traffic. With the defaults (a check every 15 seconds and several passes before it's healthy), that's close to a minute before a pod that's already running takes a single request. During a spike, that minute is when you needed it.

### LCUs make the bill hard to predict

An ALB bills by the hour plus Load Balancer Capacity Units. An LCU is measured on four dimensions, and each hour you pay for whichever is highest:

| Dimension | One LCU is about |
| --- | --- |
| New connections | 25 per second |
| Active connections | 3,000 per minute |
| Processed bytes | 1 GB per hour (EC2 and IP targets) |
| Rule evaluations | 1,000 per second |

Two things make that awkward on a busy cluster:

- **Rule evaluations scale with the number of rules.** Only the first ten rules are free. An ingress group with 80 rules is billed as if every request were checked against all of them. Sharing one ALB to save on the hourly charge can raise the LCU charge.
- **Spikes show up in the bill.** A burst of new connections from clients that don't reuse them (mobile apps, webhooks, a retry storm) can make new connections the highest dimension for the hour, even when you send fairly little data.

None of this is a reason to leave on its own. But if you can't explain last month's LCU line, it's worth knowing that an NLB has no rule evaluations to bill: its capacity units count connections and bytes. A proxy behind it also gives you metrics you can see.

<!-- TODO: check current LCU dimensions and prices on the ELB pricing page before publishing -->

### Health checks multiply

Every ALB node health checks every target, in every target group. Add ALBs, target groups and pods, and that traffic grows with all three. In instance mode, every node is health checked for every service. It's rarely what brings a cluster down, but it shows up in access logs, in app metrics, and on small pods that have to answer a constant stream of health checks.

### Deploys cause 502s

This is the one that usually starts the conversation. When a pod terminates, two things happen at about the same time. The kubelet sends SIGTERM, and the controller deregisters the pod's IP from the target group. They aren't coordinated. If the app exits before the ALB stops sending it traffic, the requests in flight get a 502.

The usual fixes help:

- Pod readiness gates, so new pods take traffic only once the ALB reports them healthy.
- A `preStop` sleep longer than the time it takes to deregister.
- A `deregistration_delay` matched to your longest request.

That's three settings, tuned per service, and they drift apart. An in-cluster proxy watches EndpointSlices directly and stops routing to a terminating pod within a second or two.

<!-- TODO: the incident where this bit us -->

### You need routing the ALB doesn't do

The ALB matches on host, path, headers, query strings and source IP, and it can split traffic by weight across target groups. That covers a lot. But it isn't a full L7 proxy, and these are the requests that tend to push teams past it:

- Retries, timeouts and circuit breaking per route.
- Rate limiting per client or per API key, beyond what WAF rate rules do.
- Request mirroring to test a new version against real traffic.
- Canaries that move traffic step by step on metrics, with Argo Rollouts or Flagger driving the proxy.
- Rewriting requests and responses beyond simple host and path changes.
- Auth that calls your own service instead of an OIDC provider.

<!-- TODO: check current ALB rewrite/transform support before publishing; AWS keeps adding to it -->

### You can't see per-route latency

The ALB reports metrics to CloudWatch per load balancer and target group, and writes access logs to S3. If you want p99 latency per route in the same Prometheus as everything else, or traces that begin at the edge, a proxy you run gives you that for free. With the ALB, you're joining log files.

### Changes are slow

Every Ingress change becomes AWS API calls. Registering targets, creating rules and waiting for health checks take seconds to minutes, and a large cluster can hit API rate limits during a big rollout. A change to an in-cluster proxy takes effect as soon as it reloads its config.

## What it looks like

The usual setup keeps AWS at the edge and moves routing inside:

```
client → NLB (or one ALB) → proxy pods → service pods
```

- **NLB in front** if you want the proxy to handle TLS, or need TCP, gRPC everywhere, or mTLS to the client. The NLB just passes connections through.
- **One ALB in front** if you still want WAF and ACM at the edge. The ALB has one rule that sends everything to the proxy, and the proxy handles the rest.

Either way, AWS manages one load balancer instead of dozens. Routing becomes Kubernetes resources that live in Git next to the services.

For the proxy itself, I'd pick something that implements the **Gateway API**: Envoy Gateway, Istio's gateway, Cilium, Traefik, Kong or NGINX Gateway Fabric. Gateway API splits ownership cleanly. The platform team owns the `Gateway` (listeners, certificates, which namespaces can attach), and app teams own their `HTTPRoute`s. That's the split ingress groups were trying to give you with annotations.

```yaml title="httproute.yaml"
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: checkout
  namespace: checkout
spec:
  parentRefs:
    - name: public
      namespace: gateway
  hostnames: ["shop.example.com"]
  rules:
    - matches:
        - path: { type: PathPrefix, value: /checkout }
      backendRefs:
        - name: checkout
          port: 8080
          weight: 90
        - name: checkout-canary
          port: 8080
          weight: 10
```

> [!WARNING]
> If you're on ingress-nginx, plan a move. The project was retired in 2026 and no longer gets fixes, security fixes included. Don't start anything new on it.

## What you take on

This is where people underestimate it. The proxy is now tier 0. If it goes down, every service behind it goes down too.

- **You run it.** Upgrades, CVEs, config reloads, memory leaks under load. Someone has to own it and be on call for it.
- **Capacity.** It needs its own node pool, or at least its own priority class and PDBs, and an HPA tuned for connection count, not just CPU. Don't let consolidation reschedule it mid-day. (See "Karpenter: you're holding it wrong".)
- **Spikes are now your problem.** The NLB in front scales well for this, but the proxy pods have to scale too. Run enough spare capacity to take a spike before the HPA reacts.
- **One more hop.** Usually under a millisecond, but it's another thing between the client and the pod, and you have to plan for zones. Cross-zone traffic from the proxy to pods costs money.
- **Certificates.** If TLS moves into the cluster, you need cert-manager, a plan for the keys, and alerts for when renewals fail. ACM did all of this for you.
- **Client IPs.** With an NLB in front you'll need proxy protocol or `externalTrafficPolicy: Local` to keep the real client address. Get it wrong and your rate limits and logs all show the same IP.
- **Shared failure.** One bad route, or a config the proxy refuses to load, can affect every tenant. Validate in CI and use a staging Gateway.

## How I'd decide

Stay on the ALB if:

- You have fewer than about a dozen services, and they're happy with host and path routing.
- Nobody on the team wants to be on call for a proxy.
- The 502s go away with readiness gates and a `preStop` sleep.

Move routing into the cluster if two or more of these are true:

- [ ] You're running enough ALBs that the base cost shows up in reviews.
- [ ] You've hit, or are close to, a rule, certificate or target quota.
- [ ] Traffic arrives in sudden spikes and you've seen ELB 5xx errors during them.
- [ ] You can't explain the LCU line on the bill.
- [ ] Teams need retries, rate limits, mirroring or progressive canaries.
- [ ] You want per-route metrics and traces in the stack you already have.
- [ ] Ingress changes are slow enough that people complain about deploys.
- [ ] You have a platform team that can own a tier-0 component.

The last one is the real gate. A reverse proxy in the cluster solves real problems, but only if someone owns it. Without an owner, you've swapped an AWS-managed load balancer for one you manage yourself.

<!-- TODO: closing line about what we ended up doing, and what we'd do differently -->
