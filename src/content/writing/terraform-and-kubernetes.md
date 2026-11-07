---
title: Don't use Terraform to manage what runs on Kubernetes
dek: Terraform is great at building the cluster. It's the wrong tool for what goes inside it, and the failure modes show up at the worst possible time.
date: 2026-11-06
tags: [kubernetes, terraform, platform]
draft: true
---

<!-- DRAFT: outline with working prose. Add a real story for the opening if you have one. -->

It starts reasonably. You already build the VPC, the EKS cluster and the node IAM roles in Terraform, so adding a `helm_release` for the ingress controller feels tidy. One tool, one plan, one apply. A year later the module has forty Helm releases, a dozen `kubernetes_manifest` resources, and nobody wants to run `terraform apply` on a Friday.

## Plan and apply is not reconcile

Terraform compares its state file to the world when you run it, and not otherwise. Kubernetes is built around controllers that reconcile all the time. Put the first in charge of the second and you get two systems with different ideas of the truth.

- Controllers and webhooks mutate objects after creation: defaults, annotations, injected sidecars, HPA-managed replica counts. Terraform sees that as drift and wants to undo it.
- You end up with `ignore_changes` blocks that grow every quarter, each one a small admission that Terraform shouldn't own this field.

## The chicken-and-egg plan

The Kubernetes and Helm providers need to connect to a cluster at plan time. If that cluster is created in the same configuration, the provider's endpoint and credentials are unknown during the first plan. It might work. It might fail in confusing ways. It will definitely fail when you need to replace the cluster.

`kubernetes_manifest` has its own version of this: it needs the CRD's schema at plan time, so you can't install an operator and create its custom resources in the same apply.

## Deletes and ordering

Destroying a namespace in Terraform before the LoadBalancer Service in it has released its cloud load balancer, or before finalizers have run, leaves orphaned resources and hung applies. Kubernetes handles teardown order with finalizers and owner references. Terraform's dependency graph doesn't know about any of that.

## Secrets in state

Anything you pass through Terraform into a Secret or Helm values ends up in the state file in plain text. Now your state bucket is as sensitive as the cluster.

## Where the line goes

<!-- TODO: your own version of this boundary -->

- **Terraform:** network, cluster, node groups or Karpenter's IAM and queue, cloud resources apps depend on (databases, buckets, IAM roles for service accounts), and a minimal bootstrap of your GitOps agent.
- **GitOps (Argo CD / Flux):** everything that runs *on* the cluster, including add-ons like ingress, cert-manager, external-dns and the monitoring stack.

Pass the values that cross the boundary (role ARNs, bucket names) through something both sides can read: outputs written to a config repo, SSM parameters, or cluster labels picked up by the GitOps agent.

## The reasonable exceptions

- Bootstrapping the GitOps agent itself.
- Throwaway or test clusters where the whole thing is created and destroyed together.
- Very small setups where one person owns everything and accepts the trade-offs.

If you're already deep in it, migrate one release at a time: remove it from state with `terraform state rm`, adopt it in Argo CD or Flux, and confirm there's no diff before moving on.
