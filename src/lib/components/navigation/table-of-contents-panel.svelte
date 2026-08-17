<script lang="ts">
  import { observe_active_heading } from '$lib/browser/active-heading'
  import type { HeadingEntry } from '$lib/content/headings'

  import TocList from './toc-list.svelte'

  interface Props {
    entries: readonly HeadingEntry[]
    on_close: () => void
  }

  /* oxlint-disable prefer-const -- Props can update with route data. */
  let { entries, on_close }: Props = $props()
  let active_index = $state(0)

  function observe_panel() {
    const media_query = window.matchMedia('(max-width: 40rem)')
    let cleanup: (() => void) | undefined

    const sync = () => {
      cleanup?.()
      cleanup = media_query.matches
        ? observe_active_heading(entries, (index) => {
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
</script>

<nav class="toc-panel" aria-label="On this page" {@attach observe_panel}>
  <p class="label">On this page</p>
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
    font-family: var(--font-stack-mono);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }
</style>
