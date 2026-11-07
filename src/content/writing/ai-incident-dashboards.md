---
title: Every incident gets its own dashboard
dek: A practice worth adopting. When an incident opens, an agent builds a Grafana dashboard for that event alone, with the right services, the right time window and every change marked on it. The postmortem then cites panels instead of screenshots.
date: 2026-11-07
tags: [ai, incident-response, observability, reliability]
draft: true
---

<!-- DRAFT: outline with working prose. Replace the TODO notes with your own examples. Companion to "How to build an AI triage skill". -->

Think about the last postmortem you read. Somewhere in it there's a screenshot of a graph. It's cropped a little wrong, the time range doesn't quite match the timeline, the legend is cut off, and nobody can tell which query made it. Three weeks later, someone asks "was the latency spike before or after the deploy?", and the answer is in a dashboard that no longer shows that time range, because the metrics have aged out.

Our service dashboards are built for running services day to day. They're the wrong tool for understanding one event. An incident needs its own view: the services involved, the window it happened in, the changes that landed around it, and the signals that tell the story, all in one place.

Building that by hand takes an hour nobody has during an incident and nobody wants to spend after it. It's exactly the kind of work an agent is good at. So here's the practice: **every incident gets its own dashboard, generated when it opens, kept up to date while it runs, and attached to the postmortem when it's done.**

## What goes on an incident dashboard

The same layout every time, so people know where to look:

1. **The header.** Incident ID, severity, status, the on-call engineer, links to the incident channel and the postmortem. A text panel, generated.
2. **What users saw.** The SLO for the affected routes, with error budget burn, from the edge. This is the panel the postmortem's impact section cites.
3. **The alerting signal.** Whatever fired, with its threshold drawn on the graph.
4. **The service's golden signals.** Rate, errors, latency and saturation for the affected service.
5. **Its dependencies.** The same signals for each direct dependency, one row each, so you can see which one moved first.
6. **Changes.** Deploys, feature flag changes, config changes and infrastructure events in the window, as annotations on every panel, not as a separate list.
7. **Logs and traces.** A logs panel filtered to the service and error level, and slow traces from the window, so you can jump from a spike to an example.
8. **The timeline.** Every entry in the incident timeline (declared, mitigated, resolved, and the key moments between) as annotations too.

The time range is fixed, from a while before the first signal to a while after resolution. It doesn't say "last 6 hours." It says what happened.

## How the agent builds it

This follows the same rule as the [triage skill](/writing/ai-triage-skills/): **use the model for judgment, and code for everything else.** The agent decides what belongs on the dashboard. A script builds it.

The agent's job is to write a small spec:

```yaml title="incidents/INC-2291/dashboard.yaml"
incident: INC-2291
title: Checkout 5xx after deploy 4812
window:
  from: 2026-09-14T02:40:00Z
  to: 2026-09-14T04:10:00Z
service: checkout
dependencies: [orders, inventory, payments-gateway]
slo_routes: [checkout/checkout, checkout/cart]
extra_panels:
  - title: Orders DB connection pool
    query: max by (pod) (db_pool_in_use{service="orders"}) / max by (pod) (db_pool_size{service="orders"})
    why: Pool saturation is the likely cause; this shows when it started.
annotations:
  - source: deploys
  - source: flags
  - source: incident-timeline
```

The script does the rest, deterministically:

- Turns the spec into a Grafana dashboard, from templates for each row: the header, SLO panels, golden signals and dependency rows. The layout is the same every time because it isn't up to the model.
- Fills in the standard queries for the service and its dependencies from the service catalog, so the agent never invents a metric name.
- Adds the annotation queries for deploys, flags and the timeline.
- Saves it to a dedicated incidents folder in Grafana through the API, and commits the spec and the generated JSON next to the postmortem.

The agent's judgment goes into the parts that need it: which dependencies matter, which extra panels tell the story, and a sentence on **why** each extra panel is there. That sentence becomes the panel's description, so a reader six months later knows what they're looking at.

<!-- TODO: the template set you start with, and which dashboard-as-code tool you use (JSON templates, Grafonnet, the Grafana Foundation SDK) -->

## Check every panel before it's saved

An incident dashboard is evidence. A panel that shows nothing, or the wrong thing, is worse than no panel.

Before saving, the script runs every query against the data source for the incident window and checks:

- **It returns data.** An empty panel usually means a made-up metric name or label. Drop it, and tell the agent why.
- **It's the right shape.** A rate that's negative or a percentage over 100 means a broken query.
- **The extra panels support their reason.** If the agent says pool saturation started at 03:09, the query had better show that. If it doesn't, the panel is kept, marked as not supporting the claim, and the claim goes back to the agent.

That's the same feedback sensor as the triage skill's `verify_claims`, pointed at panels instead of sentences.

## Keep it safe

The dashboard agent reads the same untrusted text as any incident tooling: alert annotations, log lines, ticket bodies. Treat it the same way.

- **Its own Grafana service account**, with editor rights on the incidents folder only. It can't touch the service dashboards everyone relies on.
- **Read-only data source access.** It can query; it can't write or delete.
- **Text panels are escaped.** Anything copied from an alert or log into a description or header is shown as text, never as HTML or a link that someone else wrote.

## During the incident

The dashboard is useful as soon as it exists, not just in the postmortem.

- **Built in the first few minutes**, alongside triage, and posted to the incident channel. Everyone looks at the same thing instead of their own favourite dashboards at different time ranges.
- **Updated as things happen.** When someone writes "rolled back 4812" in the channel, it appears as an annotation. When the investigation turns to a new dependency, the agent adds its row.
- **The end of the window moves** until the incident is resolved, then freezes.

## After: the postmortem cites panels

This is where the practice pays off. Every factual claim in the postmortem links to a panel, with the time range already set:

```markdown title="postmortems/INC-2291.md"
## Impact
Checkout returned errors for 31% of requests from 03:12 to 03:47 UTC.
[SLO panel](https://grafana.example.com/d/inc-2291?viewPanel=2)

## Root cause
Deploy 4812 reduced the orders DB connection pool from 50 to 10. Pool
saturation reached 100% at 03:11, a minute before errors began.
[Pool saturation](https://grafana.example.com/d/inc-2291?viewPanel=14)
```

The agent drafts this from the timeline and the dashboard, and every sentence it writes has to cite a panel or a timeline entry. People edit it and own the conclusions. But the facts are linked, checkable and consistent with each other, because they all come from the same dashboard.

Now "was the spike before or after the deploy?" is a click, not an argument.

## Make it outlive your metrics retention

Metrics don't last forever. If Prometheus keeps fifteen days of data, the dashboard is empty a month after the postmortem, which is about when someone wants to look at it again.

- **Take a snapshot when the incident is closed.** Grafana snapshots store the data with the dashboard, so it still renders after the source data is gone.
- **Or keep the data longer** for the incident window: copy the series into long-term storage, tagged with the incident ID.
- **Render a static image of each cited panel** as a last resort, stored with the postmortem. It's not interactive, but it never breaks.

<!-- TODO: what you chose, and your retention numbers -->

## Let each incident improve the next one

This fits the compounding step from the [triage skill](/writing/ai-triage-skills/). After each postmortem:

- If an extra panel was cited in the root cause, propose adding it to the service's standard row. The next incident's dashboard starts with it.
- If the same panel shows up in three incident dashboards for the same service, it probably belongs on the service's everyday dashboard, and maybe in an alert.
- If a panel was dropped for returning no data, check whether that's a missing metric. A signal you needed and didn't have is a finding in itself.

Over time, incident dashboards become a record of how each service fails, and the service dashboards get better because of them.

## Where to start

- [ ] Pick a layout and build the templates by hand, once.
- [ ] Write the script that turns a spec into a dashboard, and test it on your last five incidents.
- [ ] Give the agent the job of writing the spec, with a scoped service account.
- [ ] Add query checks before anything is saved.
- [ ] Post the dashboard link in the incident channel automatically.
- [ ] Snapshot it at close, and require postmortem claims to cite a panel.

It's a small practice. But once every incident has its own dashboard, postmortems stop arguing about what happened and start talking about why.

<!-- TODO: closing line from a real incident where this helped, or would have -->
