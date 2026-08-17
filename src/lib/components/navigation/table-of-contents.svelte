<script lang="ts">
  import { observe_active_heading } from '$lib/browser/active-heading'
  import type { HeadingEntry } from '$lib/content/headings'

  import TocList from './toc-list.svelte'

  interface Props {
    entries: readonly HeadingEntry[]
  }

  /* oxlint-disable prefer-const -- TOC state follows document scrolling. */
  let { entries }: Props = $props()
  let active_index = $state(0)
  let has_hover = $state(false)
  let toc_visible = $state(false)

  const wide_media_query = '(min-width: 80rem)'

  function observe_visibility(rail: HTMLElement) {
    const article = rail.closest('article')
    if (!article) {
      toc_visible = true
      return
    }

    const sync_visibility = () => {
      const bounds = article.getBoundingClientRect()
      const midpoint = window.innerHeight * 0.5
      const rail_bottom =
        midpoint + rail.getBoundingClientRect().height * 0.5
      toc_visible = bounds.top <= midpoint && bounds.bottom >= rail_bottom
    }
    let frame: number | undefined
    const schedule_visibility = () => {
      if (frame !== undefined) return
      frame = requestAnimationFrame(() => {
        frame = undefined
        sync_visibility()
      })
    }
    const resize_observer = new ResizeObserver(schedule_visibility)

    resize_observer.observe(article)
    resize_observer.observe(rail)
    window.addEventListener('scroll', schedule_visibility, {
      passive: true,
    })
    window.addEventListener('pageshow', schedule_visibility)
    window.addEventListener('resize', schedule_visibility)
    schedule_visibility()

    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      resize_observer.disconnect()
      window.removeEventListener('scroll', schedule_visibility)
      window.removeEventListener('pageshow', schedule_visibility)
      window.removeEventListener('resize', schedule_visibility)
    }
  }

  function observe_rail(rail: HTMLElement) {
    const media_query = window.matchMedia(wide_media_query)
    let cleanup: (() => void) | undefined

    const sync = () => {
      cleanup?.()
      if (!media_query.matches) {
        toc_visible = false
        cleanup = undefined
        return
      }

      const cleanup_headings = observe_active_heading(entries, (index) => {
        active_index = index
      })
      const cleanup_visibility = observe_visibility(rail)
      cleanup = () => {
        cleanup_headings()
        cleanup_visibility?.()
      }
    }

    media_query.addEventListener('change', sync)
    sync()

    return () => {
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
    class:has-hover={has_hover}
    class:is-visible={toc_visible}
    {@attach observe_rail}
  >
    <TocList
      {entries}
      {active_index}
      variant="rail"
      on_hover={(active) => (has_hover = active)}
    />
  </aside>
{/if}

<style>
  .toc-rail {
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

  @media (width < 80rem) {
    .toc-rail {
      display: none;
    }
  }
</style>
