<script lang="ts">
  import { observe_active_heading } from '$lib/browser/active-heading'
  import { compact_viewport_query } from '$lib/browser/viewport'
  import type { HeadingEntry } from '$lib/content/headings'

  import TocList from './toc-list.svelte'

  interface Props {
    entries: readonly HeadingEntry[]
    on_close: () => void
  }

  let { entries, on_close }: Props = $props()
  let active_index = $state(0)

  const observe_panel = $derived.by(() => {
    const current_entries = entries

    return () => {
      const media_query = window.matchMedia(compact_viewport_query)
      let cleanup: (() => void) | undefined

      const sync = () => {
        cleanup?.()
        active_index = 0
        cleanup = media_query.matches
          ? observe_active_heading(current_entries, (index) => {
              active_index = index
            })
          : undefined
      }

      media_query.addEventListener('change', sync)
      sync()

      return () => {
        cleanup?.()
        media_query.removeEventListener('change', sync)
      }
    }
  })
</script>

<nav class="toc-panel" aria-label="本页目录" {@attach observe_panel}>
  <p class="label">本页目录</p>
  <TocList {entries} {active_index} variant="panel" on_select={on_close} />
</nav>

<style>
  .toc-panel {
    display: grid;
    min-width: 0;
    gap: 0.5rem;
  }

  .label {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }
</style>
