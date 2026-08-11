<script lang="ts">
  import { flip } from 'svelte/animate'

  import './aperture-strip.css'
  import { create_field_log_state } from './field-log-state.svelte'

  type FieldLogProps = {
    active?: boolean
    paused?: boolean
    visible: boolean
  }
  /* oxlint-disable prefer-const -- props react to live observatory state. */
  let { active = false, paused = false, visible }: FieldLogProps = $props()
  const log = create_field_log_state(() => ({ active, paused, visible }))
</script>

<section
  class:active
  class:paused={log.at_pause_boundary}
  class:visible
  class="aperture-strip field-log"
>
  <span class="aperture-strip__meta field-meta">AP-02</span>
  <span class="aperture-strip__readout field-readout">EL 19</span>

  <div class="field-paper">
    <span class="field-heading">FIELD NOTE // 02</span>
    <div class="field-feed">
      <div class="field-stream">
        {#each log.records as record, index (record.id)}
          <article
            animate:flip={{ duration: log.reduced_motion ? 0 : 440 }}
            class:complete={index < log.records.length - 1}
            class:current={index === log.records.length - 1}
            class="field-entry"
          >
            <header class="entry-header">
              <span>REC-{String(record.id).padStart(3, '0')}</span>
              <span
                >{index === log.records.length - 1
                  ? log.status_label
                  : 'FILED'}</span
              >
            </header>
            <p class="entry-copy">
              {record.text}{#if index === log.records.length - 1}
                <span aria-hidden="true" class="caret"></span>
              {/if}
            </p>
            {#if index === log.records.length - 1 && log.corruption}
              <span
                aria-hidden="true"
                class="entry-corruption"
                style:--corruption-x={`${log.corruption_x}%`}
                style:--corruption-y={`${log.corruption_y}%`}
                >{log.corruption}</span
              >
            {/if}
          </article>
        {/each}
      </div>
    </div>
  </div>
  <span aria-hidden="true" class="field-scan"></span>
  <span aria-hidden="true" class="field-crash"></span>
</section>

<style>
  .field-log {
    --field-line: color-mix(in oklab, var(--color-rule) 76%, transparent);
    --field-card: color-mix(in oklab, var(--color-paper) 14%, transparent);
    --strip-label-z-index: 2;
    --strip-line: var(--field-line);
    --strip-reveal-delay: 120ms;
  }

  .field-heading {
    color: color-mix(
      in oklab,
      var(--color-stage-ink) 60%,
      var(--color-stage-ink-secondary)
    );
    font-family: var(--font-stack-sans);
    font-size: clamp(0.4rem, 0.55vw, 0.56rem);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1;
    transition: color var(--dur-content) var(--ease-state);
  }

  .field-paper {
    position: absolute;
    z-index: 1;
    inset: 1.7rem 0.8rem 1.45rem;
    display: flex;
    flex-direction: column;
    min-width: 0;
    opacity: 0;
    transition: opacity 680ms var(--ease-out);
  }

  .field-log.visible .field-paper {
    opacity: 1;
  }

  .field-paper .field-heading {
    flex: 0 0 auto;
  }

  .field-feed {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    margin-top: 0.6rem;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgb(0 0 0 / 0.22) 12%,
      black 32%,
      black 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgb(0 0 0 / 0.22) 12%,
      black 32%,
      black 100%
    );
    mask-mode: alpha;
  }

  .field-stream {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    gap: 0.42rem;
    z-index: 1;
  }

  .field-entry {
    contain: paint;
    position: relative;
    min-width: 0;
    overflow: hidden;
    padding: 0.46rem 0.52rem 0.52rem;
    border: 1px solid var(--field-line);
    background: var(--field-card);
    transition:
      background-color var(--dur-content) var(--ease-out),
      border-color var(--dur-content) var(--ease-out),
      opacity var(--dur-content) var(--ease-out);
  }

  .field-entry.complete {
    opacity: 0.68;
  }

  .field-entry.current {
    border-color: color-mix(
      in oklab,
      var(--color-ink) 36%,
      var(--field-line)
    );
  }

  .field-entry.current::before,
  .field-entry.current::after {
    position: absolute;
    pointer-events: none;
    content: '';
    opacity: 0;
  }

  .field-entry.current::before {
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0 0.6rem,
      color-mix(in oklab, var(--signal) 32%, transparent) 0.6rem 0.64rem,
      transparent 0.64rem 1.1rem
    );
    mix-blend-mode: screen;
  }

  .field-entry.current::after {
    top: 0;
    right: 0;
    left: 0;
    height: 1px;
    background: var(--signal);
    transform: translateX(-100%);
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    gap: 0.4rem;
    color: var(--color-stage-ink-secondary);
    font-family: var(--font-stack-sans);
    font-size: 0.42rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  .entry-copy {
    min-height: 1.5em;
    margin: 0.38rem 0 0;
    color: color-mix(
      in oklab,
      var(--color-stage-ink) 64%,
      var(--color-stage-ink-secondary)
    );
    font-family: var(--font-stack-mono);
    font-size: 0.78rem;
    line-height: 1.48;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    transition: color var(--dur-surface) var(--ease-out);
  }

  .entry-corruption {
    position: absolute;
    z-index: 4;
    top: var(--corruption-y);
    left: var(--corruption-x);
    color: var(--color-accent);
    font-family: var(--font-stack-mono);
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    line-height: 1;
    mix-blend-mode: screen;
    pointer-events: none;
    text-shadow:
      0.08rem 0 color-mix(in oklab, var(--color-accent) 56%, transparent),
      -0.08rem 0 color-mix(in oklab, var(--color-ink) 42%, transparent);
    transform: skewX(-12deg);
    will-change: transform, opacity;
  }

  .caret {
    display: inline-block;
    width: 0.34em;
    height: 0.9em;
    margin-left: 0.12em;
    vertical-align: -0.1em;
    background: var(--color-accent);
    opacity: 0.82;
    animation: caret-blink 920ms steps(1, end) infinite;
    transition: background-color var(--dur-content) var(--ease-out);
  }

  .field-log.paused .caret {
    animation: none;
    opacity: 0.62;
  }

  .field-log.active .field-heading {
    color: color-mix(in oklab, var(--signal) 74%, var(--color-muted));
  }

  .field-log.active .field-entry.current {
    border-color: color-mix(in oklab, var(--signal) 58%, var(--field-line));
    background: color-mix(in oklab, var(--signal) 6%, var(--field-card));
  }

  .field-log:not(.active) .field-entry.current::before {
    animation: card-slice 3.2s steps(1, end) infinite;
  }

  .field-log:not(.active) .field-entry.current::after {
    animation: metadata-scan 3.6s steps(1, end) infinite;
  }

  .field-log:not(.active) .field-entry.current .entry-copy {
    animation: text-corrupt 2.4s steps(1, end) infinite;
  }

  .field-log:not(.active) .field-entry.current .entry-header {
    animation: metadata-flicker 3.6s steps(1, end) infinite;
  }

  .field-log:not(.active) .entry-corruption {
    animation: glyph-glitch 900ms steps(1, end) infinite;
  }

  .field-log.active .field-entry.current .entry-header,
  .field-log.active .field-entry.current .entry-copy {
    color: color-mix(in oklab, var(--signal) 72%, var(--color-muted));
  }

  .field-log.active .field-entry.current .entry-copy {
    animation: text-corrupt 5.8s steps(1, end) infinite;
  }

  .field-log.active .field-entry.current .caret {
    background: var(--signal);
  }

  .field-log.active .field-entry.current::before {
    animation: card-slice 8s steps(1, end) infinite;
  }

  .field-log.active .field-entry.current::after {
    animation: metadata-scan 8.5s steps(1, end) infinite;
  }

  .field-log.active .field-entry.current .entry-header {
    animation: metadata-flicker 9s steps(1, end) infinite;
  }

  .field-log.active .entry-corruption {
    color: var(--signal);
    text-shadow:
      0.08rem 0 color-mix(in oklab, var(--signal) 56%, transparent),
      -0.08rem 0 color-mix(in oklab, var(--color-accent) 42%, transparent);
    animation: glyph-glitch 2.1s steps(1, end) infinite;
  }

  .field-scan,
  .field-crash {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }

  .field-scan {
    --scan-alpha: 0.025;
    overflow: hidden;
    opacity: var(--scan-alpha);
    background: repeating-linear-gradient(
      to bottom,
      transparent 0 0.22rem,
      color-mix(in oklab, var(--color-ink) 42%, transparent) 0.22rem 0.25rem
    );
  }

  .field-scan::before {
    position: absolute;
    inset: -35% 0;
    background: linear-gradient(
      to bottom,
      transparent,
      color-mix(in oklab, var(--signal) 24%, transparent) 48%,
      transparent 54%,
      transparent
    );
    content: '';
    opacity: 0.9;
    transform: translateY(-60%);
    will-change: transform;
  }

  .field-crash {
    opacity: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0 1.15rem,
      color-mix(in oklab, var(--signal) 72%, transparent) 1.15rem 1.2rem,
      transparent 1.2rem 2rem
    );
  }

  .field-log.visible.active .field-scan {
    --scan-alpha: 0.08;
    animation: crt-flicker 12s steps(1, end) infinite;
  }

  .field-log.visible.active .field-scan::before {
    animation: scan-drift 14s linear infinite;
  }

  .field-log.visible.active .field-crash {
    animation: horizontal-crash 9.5s steps(1, end) both;
  }

  .field-log.visible:not(.active) .field-scan {
    --scan-alpha: 0.045;
    animation: crt-flicker 9s steps(1, end) infinite;
  }

  .field-log.visible:not(.active) .field-scan::before {
    animation: scan-drift 10s linear infinite;
  }

  .field-log.visible:not(.active) .field-crash {
    background: repeating-linear-gradient(
      to bottom,
      transparent 0 1.15rem,
      color-mix(in oklab, var(--color-accent) 62%, transparent) 1.15rem
        1.2rem,
      transparent 1.2rem 2rem
    );
    animation: horizontal-crash 8.5s steps(1, end) infinite;
  }

  @media (max-width: 38rem) {
    .field-paper {
      inset: 0.8rem 0.45rem;
    }

    .field-heading {
      font-size: 0.4rem;
    }

    .field-feed {
      margin-top: 0.42rem;
    }

    .field-stream {
      gap: 0.28rem;
    }

    .field-entry {
      padding: 0.28rem 0.32rem 0.32rem;
    }

    .entry-header {
      font-size: 0.34rem;
    }

    .entry-copy {
      margin-top: 0.26rem;
      font-size: 0.54rem;
      line-height: 1.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .field-heading,
    .field-entry,
    .entry-copy,
    .field-paper,
    .caret,
    .field-scan,
    .field-crash {
      transition: none;
    }

    .caret,
    .field-scan,
    .field-crash,
    .field-scan::before,
    .field-entry.current::before,
    .field-entry.current::after,
    .field-entry.current .entry-copy,
    .field-entry.current .entry-header,
    .entry-corruption {
      animation: none;
    }

    .field-scan,
    .field-crash {
      opacity: 0;
    }
  }

  @keyframes caret-blink {
    0%,
    48% {
      opacity: 0.82;
    }
    49%,
    100% {
      opacity: 0.12;
    }
  }

  @keyframes scan-drift {
    from {
      transform: translateY(-60%);
    }
    to {
      transform: translateY(60%);
    }
  }

  @keyframes crt-flicker {
    0%,
    91%,
    100% {
      opacity: var(--scan-alpha);
    }
    92% {
      opacity: calc(var(--scan-alpha) * 1.4);
    }
    93% {
      opacity: calc(var(--scan-alpha) * 0.65);
    }
  }

  @keyframes horizontal-crash {
    0%,
    16%,
    100% {
      opacity: 0;
      transform: translateX(0) scaleX(1);
      clip-path: inset(0);
    }
    17% {
      opacity: 0.34;
      transform: translateX(-1.2%) scaleX(1.08);
      clip-path: inset(43% 0 48% 0);
    }
    20% {
      opacity: 0;
    }
    44% {
      opacity: 0.24;
      transform: translateX(1.8%) scaleX(0.94);
      clip-path: inset(68% 0 28% 0);
    }
    47% {
      opacity: 0;
    }
    71% {
      opacity: 0.3;
      transform: translateX(-0.8%) scaleX(1.04);
      clip-path: inset(27% 0 67% 0);
    }
    74% {
      opacity: 0;
    }
  }

  @keyframes card-slice {
    0%,
    73%,
    100% {
      opacity: 0;
      clip-path: inset(0);
      transform: translateX(0);
    }
    74% {
      opacity: 0.3;
      clip-path: inset(16% 0 72% 0);
      transform: translateX(-0.08rem);
    }
    78% {
      opacity: 0;
      clip-path: inset(0 0 0 0);
      transform: translateX(0.1rem);
    }
    82% {
      opacity: 0.24;
      clip-path: inset(62% 0 24% 0);
      transform: translateX(0.05rem);
    }
    86% {
      opacity: 0;
    }
  }

  @keyframes text-corrupt {
    0%,
    87%,
    100% {
      opacity: 1;
      text-shadow: none;
      transform: translateX(0);
    }
    88% {
      opacity: 0.86;
      text-shadow:
        0.06rem 0 color-mix(in oklab, var(--signal) 58%, transparent),
        -0.05rem 0 color-mix(in oklab, var(--color-accent) 38%, transparent);
      transform: translateX(-0.04rem);
    }
    91% {
      opacity: 0.92;
      text-shadow:
        -0.05rem 0 color-mix(in oklab, var(--signal) 48%, transparent),
        0.04rem 0 color-mix(in oklab, var(--color-accent) 34%, transparent);
      transform: translateX(0.05rem);
    }
    94% {
      opacity: 1;
      text-shadow: none;
      transform: translateX(0);
    }
  }

  @keyframes metadata-scan {
    0%,
    66%,
    100% {
      opacity: 0;
      transform: translateX(-100%);
    }
    67% {
      opacity: 0.78;
      transform: translateX(20%);
    }
    71% {
      opacity: 0;
      transform: translateX(120%);
    }
  }

  @keyframes metadata-flicker {
    0%,
    78%,
    100% {
      opacity: 1;
      transform: translateX(0);
    }
    79% {
      opacity: 0.42;
      transform: translateX(-0.03rem);
    }
    81% {
      opacity: 1;
      transform: translateX(0.04rem);
    }
  }

  @keyframes glyph-glitch {
    0%,
    100% {
      opacity: 0.72;
      transform: skewX(-12deg) translateX(0);
    }
    24% {
      opacity: 0.28;
      transform: skewX(-12deg) translateX(-0.12rem);
    }
    48% {
      opacity: 0.9;
      transform: skewX(-12deg) translateX(0.08rem);
    }
    72% {
      opacity: 0.38;
      transform: skewX(-12deg) translateX(0.16rem);
    }
  }
</style>
