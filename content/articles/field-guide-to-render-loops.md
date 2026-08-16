+++
title = "Field Guide to Render Loops"
published = "2026-08-16"
summary = "A specimen technical article for checking reading measure, structured data, and highlighted code."
description = "A compact survey of deciding when a visual system should draw again."
+++

## Start from stillness

A rendering loop should have a reason to continue. The first useful question is not whether a scene _can_ draw at sixty frames per second, but what visual fact changes often enough to justify it.

For a distant field with slow orbital motion, a capped cadence can preserve the perception of movement while leaving more room for input, layout, and the rest of the machine.

> [!NOTE]
> This is specimen content for the article layout. It is intentionally small, but uses the same Markdown path as a future technical post.

## Keep the budget visible

::table
+++
caption = "A deliberately small render budget"
+++

| surface       |      cadence | constraint         |
| :------------ | -----------: | :----------------- |
| sky field     |       45 fps | capped pixel ratio |
| text matrix   | event-driven | changed cells only |
| static chrome |    on demand | no frame loop      |

::

The arrangement is not a universal prescription. It is a way to make the cost of animation legible before detail accumulates around it.

## A narrow scheduler

```ts [frame-scheduler.ts]
const interval = 1000 / 45

function schedule(next_frame: FrameRequestCallback) {
  return window.setTimeout(
    () => window.requestAnimationFrame(next_frame),
    interval,
  )
}
```

The timer limits the request rate, while `requestAnimationFrame` keeps the draw aligned with a browser paint. When the surface is hidden, cancel both handles instead of letting an invisible scene retain its turn.

## Reading outward

This same concern has a more social counterpart in [After the Instrument](/essays/after-the-instrument): the structures around a tool decide what kind of attention it invites.
