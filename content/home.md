---
title: Caelyreth
description: Field notes on architecture, geometry, and the philosophy of space.
graphics: observatory
footer: relay-station
---

# Writing, making, and the space between {#station}

::lead
A relay station on an isolated survey planet. Field notes on architecture, geometry, and the philosophy of :accent[space] - kept by Yu, the one who stayed.
::

---

## Station directory

::station-directory

```yaml [props]
entries:
  - title: Field log
    detail: notes on architecture, geometry, space - forthcoming
  - title: Instruments
    detail: things made, still running - forthcoming
  - title: Manifest
    detail: crew of one - forthcoming
```

::

---

## Station specifications

### Panel & paint schedule

Surfaces stay pure grayscale, poured concrete. The single accent is the :accent[signal lamp]. Values as drawn, day and night shift.

::theme-token-table
::

### Stencil & lettering

Two voices: the keeper's serif for the log, the station's grotesque for labels and readings. Both variable, nothing else.

::type-specimens
::

### Night shift

The station after lights-out - same hue, only lightness and chroma move. Class-based, toggled by hand from the status panel.

---

## Markdown field manual

### Native text

This record carries _emphasis_, **strong signal**, ~~a crossed-out reading~~, `inline-code`, and a [link back to the station](#station). A hard break follows here.\
The next line remains part of the same transmission.

This paragraph carries a native attribute for a quieter annotation.{.annotation}

#### Heading level four

##### Heading level five

###### Heading level six

### Quotations and alerts

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

### Lists and tasks

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

### Table and image

| channel | status | confidence |
| :------ | :----: | ---------: |
| optical |  open  |       0.94 |
| radio   | quiet  |       0.71 |
| relay   | queued |       0.63 |

![Caelyreth station mark](/favicon.svg 'Caelyreth station mark')

### Code sample

```text
signal = "open"
observer = "Yu"
```
