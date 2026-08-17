<script lang="ts">
  import type { HeadingEntry } from '$lib/content/headings'

  interface Props {
    entries: readonly HeadingEntry[]
  }

  /* oxlint-disable prefer-const -- TOC state follows document scrolling. */
  let { entries }: Props = $props()
  let active_index = $state(0)
  let hover_index = $state<number | null>(null)
  let toc_visible = $state(false)

  const wide_media_query = '(min-width: 80rem)'

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

  function clear_hover(event: FocusEvent | PointerEvent) {
    const rail = event.currentTarget as HTMLElement
    const next_target = event.relatedTarget
    if (!(next_target instanceof Node) || !rail.contains(next_target)) {
      hover_index = null
    }
  }

  function observe_headings() {
    const heading_targets = entries.flatMap((entry, index) => {
      const heading = document.getElementById(entry.id)
      return heading ? [{ heading, index }] : []
    })
    const heading_indices = new Map(
      heading_targets.map(({ heading, index }) => [heading, index]),
    )
    const visible_indices = new Set<number>()
    const heading_observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const index = heading_indices.get(record.target as HTMLElement)
          if (index === undefined) continue
          if (record.isIntersecting) visible_indices.add(index)
          else visible_indices.delete(index)
        }

        const visible_index = Math.max(...visible_indices)
        if (Number.isFinite(visible_index)) active_index = visible_index
      },
      { rootMargin: '-18% 0px -68% 0px' },
    )

    for (const { heading } of heading_targets) {
      heading_observer.observe(heading)
    }

    const set_initial_heading = () => {
      const threshold = window.innerHeight * 0.3
      active_index = heading_targets.reduce(
        (index, { heading }) =>
          heading.getBoundingClientRect().top <= threshold
            ? (heading_indices.get(heading) ?? index)
            : index,
        0,
      )
    }
    set_initial_heading()

    return () => {
      heading_observer.disconnect()
    }
  }

  function observe_visibility(rail: HTMLElement) {
    const article = rail.closest('article')
    if (!article) {
      toc_visible = true
      return
    }

    const sync_visibility = () => {
      const bounds = article.getBoundingClientRect()
      const midpoint = window.innerHeight * 0.5
      toc_visible = bounds.top <= midpoint && bounds.bottom > 0
    }
    const visibility_observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const midpoint =
          entry.rootBounds?.bottom ?? window.innerHeight * 0.5
        toc_visible =
          entry.isIntersecting && entry.boundingClientRect.top <= midpoint
      },
      { threshold: 0, rootMargin: '0px 0px -50% 0px' },
    )
    visibility_observer.observe(article)
    window.addEventListener('pageshow', sync_visibility)
    window.addEventListener('resize', sync_visibility)
    sync_visibility()

    return () => {
      visibility_observer.disconnect()
      window.removeEventListener('pageshow', sync_visibility)
      window.removeEventListener('resize', sync_visibility)
    }
  }

  function observe_rail(rail: HTMLElement) {
    const cleanup_visibility = observe_visibility(rail)
    const media_query = window.matchMedia(wide_media_query)
    let cleanup: (() => void) | undefined

    const sync = () => {
      cleanup?.()
      cleanup = media_query.matches ? observe_headings() : undefined
    }

    media_query.addEventListener('change', sync)
    sync()

    return () => {
      cleanup_visibility?.()
      cleanup?.()
      media_query.removeEventListener('change', sync)
    }
  }
</script>

{#if entries.length}
  <aside
    class="toc-rail"
    aria-label="On this page"
    aria-hidden={!toc_visible}
    class:has-hover={hover_index !== null}
    class:is-visible={toc_visible}
    onfocusout={clear_hover}
    onpointerleave={clear_hover}
    {@attach observe_rail}
  >
    <ol class="toc-list">
      {#each entries as entry, index}
        <li
          class:current={active_index === index}
          class:hovered={hover_index === index}
          class:near-hover={is_near_hover(index)}
          class:adjacent-hover={is_adjacent_hover(index)}
          style:--toc-length={marker_length(index)}
        >
          <a
            aria-current={active_index === index ? 'location' : undefined}
            aria-label={entry.text}
            class="toc-link"
            href={`#${entry.id}`}
            onfocusin={() => (hover_index = index)}
            onpointerenter={() => (hover_index = index)}
          >
            <span aria-hidden="true" class="toc-marker"></span>
            <span class="toc-entry-label">{entry.text}</span>
          </a>
        </li>
      {/each}
    </ol>
  </aside>
{/if}

<style>
  .toc-rail {
    --toc-faint: var(--color-guide);
    --toc-muted: var(--color-muted);
    display: block;
    width: 2rem;
    max-block-size: calc(100vh - var(--header-safe-inset) - 2rem);
    overflow: visible;
    font-family: var(--font-stack-mono);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    line-height: 1.2;
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    transition:
      opacity var(--dur-short) var(--ease-out),
      visibility 0s linear var(--dur-short);
  }

  .toc-rail.is-visible {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
    transition-delay: 0s;
  }

  .toc-rail.has-hover {
    width: 12rem;
  }

  .toc-list {
    position: relative;
    display: flex;
    margin: 0;
    padding: 0.4rem 0;
    flex-direction: column;
    gap: 0;
    overflow: visible;
    list-style: none;
  }

  .toc-link {
    position: relative;
    display: flex;
    width: 2rem;
    block-size: 1.125rem;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }

  .toc-entry-label {
    position: absolute;
    inset-inline-start: 2.5rem;
    top: 50%;
    z-index: 2;
    display: block;
    max-inline-size: 9.5rem;
    color: var(--color-text-secondary);
    font-family: var(--font-stack-sans);
    font-size: 0.8125rem;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
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

  .toc-marker {
    position: relative;
    z-index: 1;
    display: block;
    width: var(--toc-length);
    height: 3px;
    flex: none;
    background: var(--toc-faint);
    transform-origin: left center;
    transition:
      width var(--dur-short) var(--ease-out),
      height var(--dur-short) var(--ease-out),
      background-color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .toc-list li {
    inline-size: 2rem;
    block-size: 1.125rem;
  }

  li.current .toc-marker {
    background: var(--color-text);
  }

  .toc-rail.has-hover .toc-marker {
    background: var(--toc-faint);
  }

  .toc-rail.has-hover li.adjacent-hover .toc-marker {
    background: var(--toc-muted);
  }

  .toc-rail.has-hover li.hovered .toc-marker {
    background: var(--color-text);
  }

  .toc-link:hover,
  .toc-link:focus-visible {
    color: var(--color-text);
  }

  .toc-link:focus-visible {
    border-radius: 0.125rem;
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  li.near-hover .toc-entry-label {
    opacity: 1;
    pointer-events: auto;
    transform: translate(0, -50%);
    visibility: visible;
    transition-delay: 0s;
  }

  li.current .toc-entry-label {
    color: var(--color-text);
  }

  .toc-rail.has-hover li.near-hover .toc-entry-label {
    color: var(--toc-muted);
  }

  .toc-rail.has-hover li.hovered .toc-entry-label {
    color: var(--color-text);
  }

  @media (max-width: 79.99rem) {
    .toc-rail {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .toc-entry-label,
    .toc-marker {
      transition: none;
    }
  }
</style>
