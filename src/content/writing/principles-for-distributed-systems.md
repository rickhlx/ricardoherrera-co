---
title: Principles for distributed systems
dek: The handful of principles I come back to whenever a system spans more than one machine, each with what it costs you, and the outage that taught it.
date: 2026-11-07
tags: [distributed-systems, reliability, platform]
draft: true
---

<!-- DRAFT: outline with working prose. Replace the TODO notes with your own incidents. Follows "Principle-based engineering": each principle names a trade-off. -->

The moment a system spans two machines, it's a distributed system, and most of what you know about programs stops being true. Calls can hang forever. Messages arrive twice, or late, or never. Two machines disagree about what time it is. A dependency can be up, down, or the worst case: up and slow.

None of that is new. The fallacies of distributed computing were written down in the 1990s, and every one of them still turns into an outage somewhere this week. What helps isn't knowing the theory. It's having a few principles your team applies by default, so nobody has to re-learn them during an incident.

These are mine. In the spirit of "Principle-based engineering", each one says what you give up for it.

## 1. Every call can fail, hang or lie

Treat every network call as three outcomes, not two: it worked, it failed, or **you don't know**. The third is the one that hurts. A request that timed out may have been done anyway: the payment went through, the row was written, the message was sent.

Design for "I don't know" first. The rest of these principles mostly follow from it.

*What it costs:* more code on every call path, and harder questions in design reviews.

## 2. Every call has a timeout, and it's shorter than the caller's

A call without a timeout is a thread, connection or goroutine you've lent out with no promise of getting it back. Under load, those add up until the caller is down too, and then its callers.

- Set a timeout on every call, including to databases, caches and queues.
- Make each hop's timeout shorter than the one above it. If the edge gives a request 2 seconds, the service behind it can't give its own dependency 5.
- Pass the deadline along with the request, so the whole chain knows how much time is left and stops working on requests nobody's waiting for.

*What it costs:* some requests that would have succeeded slowly now fail fast. That's the point, but someone will notice.

<!-- TODO: incident where a missing timeout cascaded -->

## 3. Retry carefully, or not at all

Retries turn a short blip into a recovered request. They also turn a struggling service into a dead one, because every client triples its traffic at exactly the moment the service can least take it.

- Retry only what's safe to retry (see principle 4).
- Back off exponentially, with **jitter**, so clients don't retry in sync.
- Use a **retry budget**: retries can't be more than, say, 10% of normal traffic. When the budget's spent, fail.
- Retry at one layer only. Three layers each retrying three times is 27 requests for one click.

```go title="retry.go"
// Full jitter: wait a random time between 0 and the exponential cap.
// The wait gives up as soon as the caller's deadline passes.
var err error
for attempt := 0; attempt < maxAttempts; attempt++ {
    if err = call(ctx); err == nil || !retryable(err) {
        return err
    }
    if attempt == maxAttempts-1 || !budget.Allow() {
        break // no more attempts, or no budget: return the last error
    }
    backoff := min(maxBackoff, base<<attempt)
    t := time.NewTimer(time.Duration(rand.Int63n(int64(backoff))))
    select {
    case <-ctx.Done():
        t.Stop()
        return ctx.Err()
    case <-t.C:
    }
}
return err
```

*What it costs:* some requests fail that a more aggressive client would have got through. The service stays up for everyone else.

## 4. Make writes idempotent

If a call can time out, it will be retried, by your code, a load balancer, a queue, or a user clicking again. So every write has to be safe to apply twice.

- Give each operation an **idempotency key** from the client, and store it with the result. A repeat returns the stored result instead of doing the work again.
- Prefer "set to X" over "add X". "Set balance to 50" can be repeated; "add 10 to balance" can't.
- Treat "exactly once" as a property you build out of at-least-once delivery plus deduplication. No queue gives it to you for free, whatever the docs say.

*What it costs:* a table of keys, a lookup on every write, and a decision on how long to keep them.

## 5. Bound everything

Every unbounded thing in a system is a future outage: queues, thread pools, connection pools, caches, retries, batch sizes, request bodies, result sets. Unbounded means it grows until something else breaks, usually memory, usually at 2 a.m.

- Give every queue a maximum length, and decide what happens when it's full.
- Cap concurrency per dependency (bulkheads), so one slow dependency can't take every worker.
- Paginate every list endpoint, with a maximum page size.

*What it costs:* you have to choose numbers, and you'll choose some of them wrong. A wrong limit is still better than none, because you can see it and change it.

## 6. Shed load before it sheds you

When demand is more than you can serve, something gets dropped. The only question is whether you choose what, or the system chooses for you by falling over.

- Reject early and cheaply, at the edge, before doing any work.
- Prefer rejecting new work over slowing down all work. A fast "try again later" is better than a 30-second timeout.
- Know which traffic matters most, and shed the rest first: health checks and checkout before recommendations and analytics.

*What it costs:* you will return errors on purpose, and your error-rate graph will show it.

## 7. One owner for every piece of state

Most distributed-systems pain comes from two things that both think they can write the same data. Consensus, distributed locks and two-phase commit all exist to make that work, and they're all hard to get right and slow when you do.

- Give every piece of state exactly one service that owns it and writes it. Everyone else asks, or subscribes to its changes.
- If you need coordination, use something built for it (a database transaction, etcd, a proven lock service), never something you wrote.
- Prefer designs where conflicts can't happen over designs that resolve them.

*What it costs:* sometimes an extra hop to the owner, and arguments about where the boundaries go.

## 8. Don't trust the clock

Clocks on different machines drift, jump backwards after an NTP correction, and pause during a VM migration or a long GC. Anything that depends on two machines agreeing on the time will eventually be wrong.

- Don't order events across machines by wall-clock time. Use sequence numbers, versions, or a single writer.
- Use a monotonic clock for measuring durations and timeouts.
- Treat a lease or a lock with a time limit as "probably still mine", and use a fencing token so a stale holder can't write.

*What it costs:* more fields on every record, and some designs that would have been simpler with a perfect clock.

## 9. Keep working when the control plane doesn't

Most systems have a data plane (serving requests) and a control plane (config, deploys, scaling, service discovery). The control plane is more complex, changes more often, and fails more. It shouldn't take the data plane with it.

- Cache the last good config, and keep serving with it if the control plane is gone.
- Don't make serving a request depend on a call to the control plane.
- Provision for the failure you expect ahead of time, so you don't need to scale up during it. If losing a zone means launching instances, and launching instances is what's broken, you're stuck.

*What it costs:* spare capacity you pay for every day, and a system that serves stale config for a while when things go wrong.

<!-- TODO: an outage where the control plane went down and took serving with it, or didn't, because of this -->

## 10. Contain the blast radius

Failures will happen. What you control is how far they spread.

- Split by **cells**: independent copies of the whole stack, each serving a slice of customers. A bad deploy or a poison request takes out one cell, not everyone.
- Roll out changes cell by cell, zone by zone, region by region, with time to notice in between.
- Keep the things that must never fail together (two regions, two zones) truly separate, all the way down to their dependencies.

*What it costs:* more copies of everything to run, and routing to get customers to the right one.

## 11. If you can't see it, you can't run it

In a single program, a stack trace tells you what happened. In a distributed system, a request touches ten services and no single log tells the story.

- Propagate a trace context on every call, including through queues.
- Measure from the edge, where the user is (see "When the ALB stops cutting it").
- Record every timeout, retry, rejection and fallback as a metric. They're how you see principles 2 through 6 at work, or see them failing.

*What it costs:* instrumentation in every service, and a bill for storing it.

## Using these

Ten principles is already more than a team will remember, so don't hand out the list. Turn them into questions, keep the ones your last few incidents would have caught, and put those in your design review template:

- [ ] What happens when each dependency is slow, not just down?
- [ ] What's safe to retry, and who does the retrying?
- [ ] What's the bound on every queue, pool and batch?
- [ ] Who owns each piece of state?
- [ ] What still works if the control plane is gone?

When an outage comes along that none of them would have caught, that's your next principle.

<!-- TODO: closing line, and which questions you'd keep for your own team -->
