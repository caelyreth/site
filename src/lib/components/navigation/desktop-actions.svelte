<script lang="ts">
  import { get_page_chrome } from '$lib/components/layout/page-chrome'

  import RailAction from './rail-action.svelte'
  import RailCell from './rail-cell.svelte'
  import ThemeCycle from './theme-cycle.svelte'

  const chrome = get_page_chrome()

  function scroll_to_top() {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
</script>

<div
  aria-hidden={!chrome.content_active}
  class="desktop-actions"
  inert={!chrome.content_active}
  role="group"
  aria-label="页面工具"
>
  <RailCell>
    <ThemeCycle />
  </RailCell>
  <RailCell>
    <RailAction
      icon="i-ri-arrow-up-line"
      label="返回顶部"
      on_activate={scroll_to_top}
    />
  </RailCell>
</div>

<style>
  .desktop-actions {
    display: none;
    box-sizing: border-box;
    color: var(--color-text);
    background-color: var(--color-paper-prime);
  }

  @media (width >= 40rem) {
    .desktop-actions {
      position: fixed;
      right: var(--inline-gutter);
      bottom: clamp(1.25rem, 4vw, 3rem);
      z-index: 49;
      display: flex;
      width: 2.75rem;
      border: 1px solid var(--color-boundary);
      flex-direction: column;
      transition:
        opacity var(--dur-short) var(--ease-out),
        transform var(--dur-short) var(--ease-out);
    }

    .desktop-actions > :global(.rail-cell) {
      display: grid;
      width: 100%;
      height: 2.75rem;
      place-items: center;
    }

    .desktop-actions > :global(.rail-cell + .rail-cell) {
      border-top: 1px solid var(--color-boundary);
    }

    .desktop-actions[aria-hidden='true'] {
      pointer-events: none;
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }

  @media (width >= 60rem) {
    .desktop-actions {
      right: auto;
      left: var(--content-rail-start);
    }
  }
</style>
