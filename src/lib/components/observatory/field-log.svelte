<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { flip } from 'svelte/animate'

  import './aperture-strip.css'

  type FieldLogProps = {
    active?: boolean
    paused?: boolean
    visible: boolean
  }
  type FieldRecord = {
    id: number
    text: string
  }

  const entries = [
    'The field holds its northern edge. A pale route crosses the dark and leaves no heat behind. Residual light gathers at the old meridian; the receiver stays open while the last thread returns.',
    'Transit note: the quiet interval is longer than predicted. Keep the aperture open until the last star settles. A weak trace is moving below the marked plane, too slow to call weather and too clean to call noise.',
    'The return signal arrives clean. Mark the change, wait for the dust to clear, and begin the next observation. Three distant points remain aligned after the route is gone; their order is unchanged.',
  ]
  const corruption_glyphs = ['//', '::', '++', '..', 'XX', '00', '<>']
  const max_records = 3

  /* oxlint-disable prefer-const -- props react to live observatory state. */
  let { active = false, paused = false, visible }: FieldLogProps = $props()

  // MARK: - typewriter
  let records = $state<FieldRecord[]>([{ id: 1, text: '' }])
  let next_record_id = $state(2)
  let entry_index = $state(0)
  let character_index = $state(0)
  let phase = $state<'typing' | 'holding'>('typing')
  let reduced_motion = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let corruption = $state('')
  let corruption_x = $state(48)
  let corruption_y = $state(36)
  let corruption_timer: ReturnType<typeof setTimeout> | undefined

  const status_label = $derived(
    paused && (phase !== 'typing' || ends_word(current_text()))
      ? 'HOLD'
      : phase === 'typing'
        ? 'WRITE'
        : 'FILED',
  )
  const at_pause_boundary = $derived(
    paused && (phase !== 'typing' || ends_word(current_text())),
  )

  function current_record() {
    return records.at(-1)
  }

  function current_text() {
    return current_record()?.text ?? ''
  }

  function ends_word(value: string) {
    const character = value.at(-1)
    return character === undefined || /[\s.,;:!?]/.test(character)
  }

  function should_finish_current_word() {
    return paused && phase === 'typing' && !ends_word(current_text())
  }

  function can_advance() {
    return (
      visible &&
      !reduced_motion &&
      (!paused || should_finish_current_word())
    )
  }

  function clear_timer() {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
  }

  // MARK: - corruption
  function clear_corruption_timer() {
    if (corruption_timer === undefined) return
    clearTimeout(corruption_timer)
    corruption_timer = undefined
  }

  function can_schedule_corruption() {
    return corruption_timer === undefined && visible && !reduced_motion
  }

  function schedule_corruption(is_active: boolean) {
    if (!can_schedule_corruption()) return
    corruption_timer = setTimeout(
      () => {
        corruption_timer = undefined
        corruption =
          corruption_glyphs[
            Math.floor(Math.random() * corruption_glyphs.length)
          ]
        corruption_x = 34 + Math.random() * 50
        corruption_y = 18 + Math.random() * 68
        schedule_corruption(active)
      },
      is_active ? 900 + Math.random() * 700 : 420 + Math.random() * 400,
    )
  }

  function can_schedule_typewriter() {
    return (
      timer === undefined &&
      visible &&
      !reduced_motion &&
      (!paused || should_finish_current_word())
    )
  }

  function schedule(delay: number) {
    if (!can_schedule_typewriter()) return
    timer = setTimeout(() => {
      timer = undefined
      advance()
    }, delay)
  }

  function character_delay(character: string) {
    if (character === '\n') return 520 + Math.random() * 260
    if (/[.!?]/.test(character)) return 420 + Math.random() * 360
    if (/[,;:]/.test(character)) return 180 + Math.random() * 180
    if (character === ' ') return 24 + Math.random() * 38
    return 30 + Math.random() * 68
  }

  function advance_typing() {
    const entry = entries[entry_index]
    if (character_index >= entry.length) {
      phase = 'holding'
      schedule(1200 + Math.random() * 1100)
      return
    }

    const record = current_record()
    if (!record) return
    const character = entry[character_index]
    record.text += character
    character_index += 1
    schedule(character_delay(character))
  }

  function begin_next_record() {
    entry_index = (entry_index + 1) % entries.length
    records = [...records, { id: next_record_id, text: '' }].slice(
      -max_records,
    )
    next_record_id += 1
    character_index = 0
    phase = 'typing'
    schedule(280 + Math.random() * 320)
  }

  function advance() {
    if (!can_advance()) return
    if (phase === 'typing') {
      advance_typing()
      return
    }
    begin_next_record()
  }

  function sync_typewriter() {
    if (paused) {
      if (should_finish_current_word()) {
        schedule(0)
      } else {
        clear_timer()
      }
      return
    }
    schedule(120)
  }

  $effect(() => {
    const is_active = active
    if (!visible || reduced_motion) {
      clear_corruption_timer()
      corruption = ''
      return
    }
    clear_corruption_timer()
    corruption = ''
    schedule_corruption(is_active)
  })

  $effect(() => {
    if (!visible || reduced_motion) {
      clear_timer()
      return
    }
    sync_typewriter()
  })

  onMount(() => {
    const media_query = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const handle_reduced_motion = () => {
      reduced_motion = media_query.matches
      if (!reduced_motion) return
      clear_timer()
      const record = current_record()
      if (!record) return
      record.text = entries[entry_index]
      character_index = record.text.length
      phase = 'holding'
    }

    handle_reduced_motion()
    media_query.addEventListener('change', handle_reduced_motion)

    return () => {
      media_query.removeEventListener('change', handle_reduced_motion)
      clear_timer()
      clear_corruption_timer()
    }
  })

  onDestroy(() => {
    clear_timer()
    clear_corruption_timer()
  })
</script>

<section
  class:active
  class:paused={at_pause_boundary}
  class:visible
  class="observatory-strip field-log"
>
  <span class="observatory-strip__meta field-meta">AP-02</span>
  <span class="observatory-strip__readout field-readout">EL 19</span>

  <div class="field-paper">
    <span class="field-heading">FIELD NOTE // 02</span>
    <div class="field-feed">
      <div class="field-stream">
        {#each records as record, index (record.id)}
          <article
            animate:flip={{ duration: reduced_motion ? 0 : 440 }}
            class:complete={index < records.length - 1}
            class:current={index === records.length - 1}
            class="field-entry"
          >
            <header class="entry-header">
              <span>REC-{String(record.id).padStart(3, '0')}</span>
              <span
                >{index === records.length - 1
                  ? status_label
                  : 'FILED'}</span
              >
            </header>
            <p class="entry-copy">
              {record.text}{#if index === records.length - 1}
                <span aria-hidden="true" class="caret"></span>
              {/if}
            </p>
            {#if index === records.length - 1 && corruption}
              <span
                aria-hidden="true"
                class="entry-corruption"
                style:--corruption-x={`${corruption_x}%`}
                style:--corruption-y={`${corruption_y}%`}>{corruption}</span
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
    --observatory-strip-label-z-index: 2;
    --observatory-strip-fill: var(--strip-fill);
    --observatory-strip-line: var(--field-line);
    --observatory-strip-reveal-delay: 120ms;
  }

  .field-heading {
    color: color-mix(in oklab, var(--color-ink) 60%, var(--color-muted));
    font-family: var(--font-stack-sans);
    font-size: clamp(0.4rem, 0.55vw, 0.56rem);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1;
    transition: color 480ms cubic-bezier(0.4, 0, 0.2, 1);
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
      background-color 480ms var(--ease-out),
      border-color 480ms var(--ease-out),
      opacity 480ms var(--ease-out);
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
      color-mix(in oklab, var(--observatory-signal) 32%, transparent) 0.6rem
        0.64rem,
      transparent 0.64rem 1.1rem
    );
    mix-blend-mode: screen;
  }

  .field-entry.current::after {
    top: 0;
    right: 0;
    left: 0;
    height: 1px;
    background: var(--observatory-signal);
    transform: translateX(-100%);
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    gap: 0.4rem;
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.42rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  .entry-copy {
    min-height: 1.5em;
    margin: 0.38rem 0 0;
    color: color-mix(in oklab, var(--color-ink) 64%, var(--color-muted));
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.78rem;
    line-height: 1.48;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    transition: color 520ms var(--ease-out);
  }

  .entry-corruption {
    position: absolute;
    z-index: 4;
    top: var(--corruption-y);
    left: var(--corruption-x);
    color: var(--color-accent);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
    transition: background-color 480ms var(--ease-out);
  }

  .field-log.paused .caret {
    animation: none;
    opacity: 0.62;
  }

  .field-log.active .field-heading {
    color: color-mix(
      in oklab,
      var(--observatory-signal) 74%,
      var(--color-muted)
    );
  }

  .field-log.active .field-entry.current {
    border-color: color-mix(
      in oklab,
      var(--observatory-signal) 58%,
      var(--field-line)
    );
    background: color-mix(
      in oklab,
      var(--observatory-signal) 6%,
      var(--field-card)
    );
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
    color: color-mix(
      in oklab,
      var(--observatory-signal) 72%,
      var(--color-muted)
    );
  }

  .field-log.active .field-entry.current .entry-copy {
    animation: text-corrupt 5.8s steps(1, end) infinite;
  }

  .field-log.active .field-entry.current .caret {
    background: var(--observatory-signal);
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
    color: var(--observatory-signal);
    text-shadow:
      0.08rem 0
        color-mix(in oklab, var(--observatory-signal) 56%, transparent),
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
      color-mix(in oklab, var(--observatory-signal) 24%, transparent) 48%,
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
      color-mix(in oklab, var(--observatory-signal) 72%, transparent)
        1.15rem 1.2rem,
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
        0.06rem 0
          color-mix(in oklab, var(--observatory-signal) 58%, transparent),
        -0.05rem 0 color-mix(in oklab, var(--color-accent) 38%, transparent);
      transform: translateX(-0.04rem);
    }
    91% {
      opacity: 0.92;
      text-shadow:
        -0.05rem 0
          color-mix(in oklab, var(--observatory-signal) 48%, transparent),
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
