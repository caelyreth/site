<script lang="ts">
  import type { HeadingEntry } from '$lib/content/headings'

  interface Props {
    entries: readonly HeadingEntry[]
    active_index: number
    variant: 'rail' | 'panel'
    on_hover?: (active: boolean) => void
    on_select?: () => void
  }

  /* oxlint-disable prefer-const -- Props follow route data and scroll state. */
  let { entries, active_index, variant, on_hover, on_select }: Props =
    $props()
  let hover_index = $state<number | null>(null)

  function marker_length(index: number) {
    if (hover_index === null) return '0.55rem'
    const distance = Math.abs(index - hover_index)
    return `${0.55 + Math.max(0, 3 - distance) * 0.28}rem`
  }

  function is_near_hover(index: number) {
    return hover_index !== null && Math.abs(index - hover_index) <= 2
  }

  function is_adjacent_hover(index: number) {
    return hover_index !== null && Math.abs(index - hover_index) === 1
  }

  function set_hover(index: number) {
    hover_index = index
    on_hover?.(true)
  }

  function clear_hover(event: FocusEvent | PointerEvent) {
    const list = event.currentTarget as HTMLElement
    const next_target = event.relatedTarget
    if (!(next_target instanceof Node) || !list.contains(next_target)) {
      hover_index = null
      on_hover?.(false)
    }
  }

  function heading_indent(depth: number) {
    return `${Math.max(0, depth - 2) * 0.625}rem`
  }
</script>

<ol
  class="toc-list"
  class:rail={variant === 'rail'}
  class:panel={variant === 'panel'}
  class:has-hover={hover_index !== null}
  onfocusout={clear_hover}
  onpointerleave={clear_hover}
>
  {#each entries as entry, index}
    <li
      class:current={active_index === index}
      class:hovered={hover_index === index}
      class:near-hover={is_near_hover(index)}
      class:adjacent-hover={is_adjacent_hover(index)}
      style:--toc-indent={heading_indent(entry.depth)}
      style:--toc-length={marker_length(index)}
    >
      <a
        aria-current={active_index === index ? 'location' : undefined}
        aria-label={entry.text}
        class="toc-link"
        href={`#${entry.id}`}
        onclick={on_select}
        onfocusin={() => set_hover(index)}
        onpointerenter={() => set_hover(index)}
      >
        <span aria-hidden="true" class="toc-marker"></span>
        <span class="toc-entry-label">{entry.text}</span>
      </a>
    </li>
  {/each}
</ol>

<style>
  .toc-list {
    --toc-faint: var(--color-guide);
    --toc-muted: var(--color-muted);
    margin: 0;
    padding: 0;
    font-variant-numeric: tabular-nums;
    list-style: none;
  }

  .toc-list.rail {
    position: relative;
    display: flex;
    padding-block: 0.4rem;
    flex-direction: column;
    gap: 0;
    overflow: visible;
  }

  .rail li {
    inline-size: 2rem;
    block-size: 1.125rem;
  }

  .rail .toc-link {
    position: relative;
    display: flex;
    width: 2rem;
    block-size: 1.125rem;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }

  .toc-marker {
    position: relative;
    z-index: 1;
    display: block;
    flex: none;
    background: var(--toc-faint);
  }

  .rail .toc-marker {
    width: var(--toc-length);
    height: 3px;
    transform-origin: left center;
    transition:
      width var(--dur-short) var(--ease-out),
      height var(--dur-short) var(--ease-out),
      background-color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .rail .toc-entry-label {
    position: absolute;
    inset-inline-start: 2.5rem;
    top: 50%;
    z-index: 2;
    display: block;
    inline-size: 9.5rem;
    overflow: hidden;
    color: var(--color-text-secondary);
    font-family: var(--font-stack-sans);
    font-size: 0.8125rem;
    line-height: 1.25;
    text-overflow: clip;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translate(-0.35rem, -50%);
    visibility: hidden;
    transition:
      color var(--dur-short) var(--ease-out),
      opacity var(--dur-micro) var(--ease-out),
      transform var(--dur-short) var(--ease-out),
      visibility 0s linear var(--dur-short);
  }

  .rail .toc-entry-label,
  .panel .toc-entry-label {
    -webkit-mask-image: linear-gradient(
      to right,
      #000 calc(100% - 1.5rem),
      transparent
    );
    -webkit-mask-size: 100% 100%;
    mask-image: linear-gradient(
      to right,
      #000 calc(100% - 1.5rem),
      transparent
    );
    mask-size: 100% 100%;
  }

  .rail li.current .toc-marker,
  .panel li.current .toc-marker {
    background: var(--color-text);
  }

  .rail.has-hover .toc-marker {
    background: var(--toc-faint);
  }

  .rail.has-hover li.adjacent-hover .toc-marker {
    background: var(--toc-muted);
  }

  .rail.has-hover li.hovered .toc-marker {
    background: var(--color-text);
  }

  .rail .toc-link:hover,
  .rail .toc-link:focus-visible {
    color: var(--color-text);
  }

  .toc-link:focus-visible {
    border-radius: 0.125rem;
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  .rail li.near-hover .toc-entry-label {
    opacity: 1;
    pointer-events: auto;
    transform: translate(0, -50%);
    visibility: visible;
    transition-delay: 0s;
  }

  .rail li.current .toc-entry-label {
    color: var(--color-text);
  }

  .rail.has-hover li.near-hover .toc-entry-label {
    color: var(--toc-muted);
  }

  .rail.has-hover li.hovered .toc-entry-label {
    color: var(--color-text);
  }

  .panel {
    display: grid;
    max-height: min(42svh, 18rem);
    overflow-y: auto;
    font-family: var(--font-stack-sans);
    scrollbar-width: thin;
  }

  .panel li {
    min-width: 0;
  }

  .panel .toc-link {
    position: relative;
    display: flex;
    min-width: 0;
    min-height: 2.125rem;
    padding-inline: calc(var(--toc-indent) + 0.25rem) 0.25rem;
    align-items: center;
    gap: 0.625rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition:
      color var(--dur-micro) var(--ease-out),
      background-color var(--dur-micro) var(--ease-out);
  }

  .panel .toc-marker {
    width: 0.375rem;
    height: 2px;
  }

  .panel .toc-entry-label {
    position: relative;
    display: block;
    min-width: 0;
    flex: 1;
    overflow: hidden;
    color: inherit;
    font-size: 0.8125rem;
    line-height: 1.3;
    text-overflow: clip;
    white-space: nowrap;
  }

  .panel .toc-link:hover,
  .panel .toc-link:focus-visible {
    color: var(--color-text);
    background-color: color-mix(
      in oklab,
      var(--color-text) 5%,
      transparent
    );
  }

  .panel li.current .toc-link {
    color: var(--color-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .rail .toc-marker,
    .rail .toc-entry-label,
    .panel .toc-link {
      transition: none;
    }
  }
</style>
