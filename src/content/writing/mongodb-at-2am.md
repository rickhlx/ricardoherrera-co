---
title: MongoDB issues that bite you at 2:00 a.m.
dek: Not the ones in the docs' getting-started guide. The ones that sit quietly for months and then page you on a Tuesday night.
date: 2026-11-06
tags: [mongodb, reliability, databases]
draft: true
---

<!-- DRAFT: outline with working prose. Each section wants one real incident (anonymized) and the alert that would have caught it earlier. -->

MongoDB is easy to start with, which is exactly why it surprises people later. Most of the incidents I've seen weren't exotic. They were defaults nobody revisited, growth nobody graphed, and application code that worked fine until the data got big. This is the list I wish I'd had before my first MongoDB pager rotation.

## Connection storms

Every application pod opens its own connection pool. Multiply `maxPoolSize` by the number of pods, then by the number of services, and compare it with what the cluster tier allows. Now add an election: every driver drops its connections and reconnects at once, and autoscaling adds pods because latency went up.

- Size pools for the pod count you have at peak, not the one in staging.
- Watch connection count against the limit, not just CPU.

## Elections you didn't plan for

Primaries step down for maintenance, auto-scaling, and node failures. With retryable writes and reads on, most of these are invisible. Without them, or with code that treats every error as fatal, they're a burst of 500s.

- Confirm retryable writes are on and your error handling tolerates a short failover.
- Test it: trigger a failover in staging and watch what the app does.

## The oplog window shrinks when you're busiest

The oplog is a fixed-size buffer. A heavy batch job or bulk update fills it faster, so the window of history a lagging secondary can catch up from gets shorter exactly when secondaries are most likely to fall behind. Past that window, the secondary needs a full resync.

- Alert on oplog window in hours, not on oplog size.
- Alert on replication lag before it approaches the window.

## A new query path does a collection scan

A feature ships with a query shape nobody indexed. It's fast on day one because the collection is small. Months later it's scanning millions of documents and pinning the CPU.

- Turn on the profiler or slow query log and watch for `COLLSCAN` and high docs-examined-to-returned ratios.
- Review query shapes in code review, not just indexes.

## Documents that never stop growing

Arrays that only get pushed to. Embedded history. Eventually you hit the 16 MB document limit, but long before that every update rewrites a large document and the working set stops fitting in the WiredTiger cache.

## Cache pressure and the working set

When the data you touch regularly no longer fits in cache, reads go to disk and latency climbs gradually, then suddenly. It often looks like "the database got slow" with no single bad query.

- Graph cache usage and dirty bytes, and pages read into cache.
- Treat a steady upward trend as a capacity ticket, not a mystery.

## Batch deletes, TTL indexes and index builds

<!-- TODO: pick whichever of these you've actually been bitten by -->

- A TTL index that suddenly has millions of expired documents to remove after a backfill.
- A large index build on a busy collection during peak.
- A huge `deleteMany` that floods the oplog and lags every secondary.

## What I'd alert on

| Signal | Why |
| --- | --- |
| Connections vs. limit | Catches pool sizing and storms before they refuse connections |
| Replication lag | Leading indicator for stale reads and resyncs |
| Oplog window (hours) | How much room you have before a resync |
| Docs examined / returned | Finds missing indexes before they're incidents |
| Cache usage and dirty % | Working-set problems show up here first |
| Elections | Should be rare and explainable |
