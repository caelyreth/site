+++
title = "Caelyreth"
description = "Field notes on architecture, geometry, and the philosophy of space."
stage = "observatory"
footer = "relay-station"
+++

## Markdown field manual {#station}

A relay station on an isolated survey planet. Field notes on architecture, geometry, and the philosophy of :accent[space] - kept by Yu, the one who stayed.

## Native text

This record carries _emphasis_, **strong signal**, ~~a crossed-out reading~~, `inline-code`, :kbd[Cmd] + :kbd[K], :mark[an observed highlight], a subscript reading :sub[2], and a superscript reading :sup[2], alongside a [link back to the station](#station). A hard break follows here.\
The next line remains part of the same transmission.

This paragraph carries a native attribute for a quieter annotation.{.annotation}

### Heading level three

#### Heading level four

##### Heading level five

###### Heading level six

## Quotations and alerts

> The observer marks the coordinate, then waits long enough for the light to become a fact.

> [!NOTE]
> Every document can carry its own reading surface without claiming another route.

> [!TIP]
> Keep calls to action in the content that owns the action.

> [!IMPORTANT]
> A component name is part of the document interface, not a presentational afterthought.

> [!WARNING]
> Do not confuse a temporary signal with a permanent navigation point.

> [!CAUTION]
> Do not publish a route until its content and visual contract agree.

## Lists and tasks

- Field ledger
  - Exposure notes
  - Instrument state
- Transmission register

1. Mark the source.
2. Read the horizon.
3. File the observation.

- [x] Frame the visual field.
- [x] Keep the document semantic.
- [ ] Publish the first field log.

## Table and image

::table
+++
caption = "Current survey channels"
+++

| channel | status | confidence |
| :------ | :----- | :--------- |
| optical | open   | 0.94       |
| radio   | quiet  | 0.71       |
| relay   | queued | 0.63       |

::

![Caelyreth station mark](/favicon.svg 'Station mark recovered from the relay archive.')

## Code sample

```ts [relay-signal.ts]
type RelaySignal = {
  observer: string
  state: 'open' | 'quiet'
}

const signal: RelaySignal = {
  observer: 'Yu',
  state: 'open',
}
```

---

## Structured notes

::details
+++
summary = "Read the instrument note"
+++

The archival receiver keeps its original calibration until a second observation confirms the drift.
::

::definition-list
:definition-term[Station coordinate]
:definition-description[The first location where a signal has enough continuity to become a record.]
:definition-term[Field mark]
:definition-description[A small visible reference that lets later observers compare the same condition.]
::

## Field reference

The current channel state remains deliberately local to this document.[^channel-state]

[^channel-state]: It is a reading aid, not a site-wide navigation model.
