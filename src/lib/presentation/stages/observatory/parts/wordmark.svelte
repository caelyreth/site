<script module lang="ts">
  import {
    WORDMARK_BOOT_DELAY_VARIANTS,
  } from '../intro'

  type BootGroup = Readonly<{
    delay: number
    matrix: string
    steady: string
  }>

  type WordmarkPaths = Readonly<{
    boot_groups: readonly BootGroup[]
  }>

  type PathState = {
    matrix_paths: string[]
    steady_paths: string[]
  }

  const glyphs: Readonly<Record<string, readonly string[]>> = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  }
  const crash_pixels = [
    { delay: 0, x: 3.2, y: 6.9 },
    { delay: 0.14, x: 19.8, y: 2.2 },
    { delay: 0.08, x: 35.8, y: 10.5 },
    { delay: 0.2, x: 52.6, y: 4.1 },
  ]
  const word = 'CAELYRETH'
  const word_y = 4
  const pixel_radius = 0.16
  const pixel_size = 0.82
  const paths = build_wordmark_paths()

  function boot_delay_for(
    letter_index: number,
    row_index: number,
    column_index: number,
  ) {
    // The mixed coordinates create a stable, scattered VFD-style boot order.
    return (
      (letter_index * 37 + row_index * 19 + column_index * 11) %
      WORDMARK_BOOT_DELAY_VARIANTS
    )
  }

  function pixel_path(x: number, y: number) {
    const inner_size = pixel_size - pixel_radius * 2
    return [
      `M${x + pixel_radius} ${y}`,
      `h${inner_size}`,
      `q${pixel_radius} 0 ${pixel_radius} ${pixel_radius}`,
      `v${inner_size}`,
      `q0 ${pixel_radius} -${pixel_radius} ${pixel_radius}`,
      `h-${inner_size}`,
      `q-${pixel_radius} 0 -${pixel_radius} -${pixel_radius}`,
      `v-${inner_size}`,
      `q0 -${pixel_radius} ${pixel_radius} -${pixel_radius}`,
      'z',
    ].join('')
  }

  function build_wordmark_paths(): WordmarkPaths {
    const state: PathState = {
      matrix_paths: Array<string>(WORDMARK_BOOT_DELAY_VARIANTS).fill(''),
      steady_paths: Array<string>(WORDMARK_BOOT_DELAY_VARIANTS).fill(''),
    }

    for (let letter_index = 0; letter_index < word.length; letter_index += 1) {
      const glyph = glyphs[word[letter_index]]
      if (!glyph) continue
      append_glyph_paths(state, glyph, letter_index)
    }

    return {
      boot_groups: state.matrix_paths.flatMap((matrix, delay) =>
        matrix
          ? [{ delay, matrix, steady: state.steady_paths[delay] }]
          : [],
      ),
    }
  }

  function append_glyph_paths(
    state: PathState,
    glyph: readonly string[],
    letter_index: number,
  ) {
    for (let row_index = 0; row_index < glyph.length; row_index += 1) {
      const row = glyph[row_index]
      for (let column_index = 0; column_index < row.length; column_index += 1) {
        if (row[column_index] === '1') {
          append_pixel_path(state, letter_index, row_index, column_index)
        }
      }
    }
  }

  function append_pixel_path(
    state: PathState,
    letter_index: number,
    row_index: number,
    column_index: number,
  ) {
    const path = pixel_path(
      letter_index * 6.5 + column_index,
      word_y + row_index,
    )
    const boot_delay = boot_delay_for(letter_index, row_index, column_index)
    state.matrix_paths[boot_delay] += path
    if (is_steady_pixel(letter_index, row_index, column_index)) {
      state.steady_paths[boot_delay] += path
    }
  }

  function is_steady_pixel(
    letter_index: number,
    row_index: number,
    column_index: number,
  ) {
    return (letter_index * 5 + row_index * 3 + column_index) % 7 === 0
  }
</script>

<script lang="ts">
  import {
    WORDMARK_BOOT_DELAY_STEP,
    WORDMARK_BOOT_DURATION,
  } from '../intro'

  type Props = {
    active?: boolean
  }

  /* oxlint-disable prefer-const -- The signal state updates from the stage. */
  let { active = false }: Props = $props()
</script>

<svg
  class:active
  aria-hidden="true"
  class="wordmark"
  fill="none"
  style:--boot-duration={`${WORDMARK_BOOT_DURATION}ms`}
  viewBox="-1 0 60 15"
>
  <g class="letters">
    {#each paths.boot_groups as group (group.delay)}
      <g
        class="boot-group"
        style:--boot-delay={`${group.delay * WORDMARK_BOOT_DELAY_STEP}ms`}
      >
        <path class="boot-matrix" d={group.matrix} />
        {#if group.steady}
          <path class="boot-steady" d={group.steady} />
        {/if}
        <path class="boot-pulse" d={group.matrix} />
      </g>
    {/each}
  </g>

  <g class="crash">
    {#each crash_pixels as pixel (pixel.x)}
      <rect
        class="crash-pixel"
        style:--crash-delay={`${pixel.delay}s`}
        x={pixel.x}
        y={pixel.y}
        width="1.6"
        height="0.82"
        rx="0.12"
      />
    {/each}
  </g>
</svg>

<style>
  .wordmark {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    pointer-events: none;
  }

  .boot-matrix {
    fill: var(--color-stage-ink-secondary);
    opacity: 0.14;
    animation: pixel-settle var(--boot-duration) var(--ease-out)
      var(--boot-delay) both;
  }

  .boot-steady {
    fill: var(--color-stage-ink);
    opacity: 0;
    animation: pixel-steady-reveal 1ms linear
      calc(var(--boot-delay) + var(--boot-duration)) both;
  }

  .boot-pulse {
    fill: var(--color-stage-ink);
    opacity: 0;
    animation: pixel-boot var(--boot-duration) var(--ease-out)
      var(--boot-delay) both;
  }

  .crash-pixel {
    fill: var(--signal);
    opacity: 0;
  }

  .wordmark.active .letters {
    animation: wordmark-crash var(--dur-stage-signal)
      var(--ease-stage-signal);
    transform-box: fill-box;
    transform-origin: center;
  }

  .wordmark.active .boot-steady {
    animation: pixel-flicker var(--dur-stage-signal)
      var(--ease-stage-signal);
  }

  .wordmark.active .crash-pixel {
    animation: pixel-crash 840ms var(--ease-stage-signal) var(--crash-delay)
      both;
  }

  @keyframes wordmark-crash {
    0%,
    8% {
      transform: translate(0);
    }
    12% {
      transform: translate(1px, -0.5px) skewX(-0.6deg);
    }
    16% {
      transform: translate(-0.75px, 0.25px) skewX(0.3deg);
    }
    22%,
    to {
      transform: translate(0);
    }
  }

  @keyframes pixel-flicker {
    0%,
    7%,
    to {
      fill: var(--color-stage-ink);
    }
    12%,
    18% {
      fill: var(--signal);
    }
  }

  @keyframes pixel-boot {
    0% {
      opacity: 0;
    }
    24%,
    58% {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes pixel-settle {
    0%,
    24% {
      opacity: 0.14;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes pixel-steady-reveal {
    to {
      opacity: 1;
    }
  }

  @keyframes pixel-crash {
    0%,
    10% {
      opacity: 0;
      transform: translateX(0);
    }
    18% {
      opacity: 0.78;
    }
    38% {
      opacity: 0.3;
      transform: translateX(1.8px);
    }
    to {
      opacity: 0;
      transform: translateX(3.2px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wordmark.active .letters,
    .boot-matrix,
    .boot-pulse,
    .boot-steady,
    .wordmark.active .boot-steady,
    .wordmark.active .crash-pixel {
      animation: none;
    }

    .boot-matrix {
      opacity: 1;
    }

    .boot-steady {
      opacity: 1;
    }
  }
</style>
