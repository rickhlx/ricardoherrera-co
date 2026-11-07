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

An ALB has limits on rules per listener, conditions per rule, target groups and certificates per listener. Some can be raised and some can't. You won't hit them with ten services. With a hundred services, or many tenants on their own hostnames, you will, and that's when people start splitting groups by hand.

> [!NOTE]
> Look up the current numbers in the Elastic Load Balancing quotas page for your account before you plan around them. They change, and several can be raised on request.

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
- [ ] You've hit, or are close to, a listener or target group quota.
- [ ] Teams need retries, rate limits, mirroring or progressive canaries.
- [ ] You want per-route metrics and traces in the stack you already have.
- [ ] Ingress changes are slow enough that people complain about deploys.
- [ ] You have a platform team that can own a tier-0 component.

The last one is the real gate. A reverse proxy in the cluster solves real problems, but only if someone owns it. Without an owner, you've swapped an AWS-managed load balancer for one you manage yourself.

<!-- TODO: closing line about what we ended up doing, and what we'd do differently -->
