<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    visible: boolean
    collapsed: boolean
    cells: number
    compact_control: string
    expanded?: boolean
    children?: Snippet<[() => void, string]>
    panel?: Snippet<[() => void]>
  }

  let {
    visible,
    collapsed,
    cells,
    compact_control,
    expanded = $bindable(false),
    children,
    panel,
  }: Props = $props()
  let panel_height = $state(0)
  let rail = $state<HTMLDivElement>()
  let rail_cells = $state<HTMLDivElement>()

  const panel_id = 'mobile-rail-panel'
  const has_panel = $derived(panel !== undefined)

  function close_panel() {
    expanded = false
  }

  function toggle_panel() {
    expanded = !expanded
  }

  function measure_panel(node: HTMLElement) {
    const sync = () => {
      panel_height = Math.ceil(node.getBoundingClientRect().height)
    }
    const observer = new ResizeObserver(sync)

    observer.observe(node)
    sync()

    return () => observer.disconnect()
  }

  $effect(() => {
    if (!visible || collapsed) close_panel()
  })

  $effect(() => {
    if (!expanded) return

    const close_on_outside_press = (event: PointerEvent) => {
      if (event.target instanceof Node && !rail?.contains(event.target)) {
        close_panel()
      }
    }

    window.addEventListener('pointerdown', close_on_outside_press)
    return () =>
      window.removeEventListener('pointerdown', close_on_outside_press)
  })

  $effect(() => {
    void cells
    const entries =
      rail_cells?.querySelectorAll<HTMLElement>('[data-rail-cell]')

    entries?.forEach((entry) => {
      entry.inert =
        !visible ||
        (collapsed && entry.dataset.railControl !== compact_control)
    })
  })
</script>

<div
  bind:this={rail}
  aria-hidden={!visible}
  class="mobile-rail"
  data-visible={visible}
  data-collapsed={collapsed}
  data-expanded={expanded}
  style:--rail-cells={cells}
  style:--rail-panel-height={`${panel_height}px`}
>
  <div class="rail-shell">
    {#if has_panel}
      <section
        id={panel_id}
        class="rail-panel"
        aria-hidden={!expanded}
        inert={!expanded}
      >
        <div {@attach measure_panel} class="rail-panel-content">
          {@render panel?.(close_panel)}
        </div>
      </section>
    {/if}

    <div bind:this={rail_cells} class="rail-cells">
      {@render children?.(toggle_panel, panel_id)}
    </div>
  </div>
</div>

<style>
  .mobile-rail {
    display: none;
  }

  @media (width < 40rem) {
    .mobile-rail {
      --rail-size: 2.75rem;
      --rail-edge: max(0.75rem, env(safe-area-inset-right));
      --rail-compact-width: calc(var(--rail-size) * var(--rail-cells));
      --rail-expanded-width: calc(
        100vw - max(var(--inline-gutter), env(safe-area-inset-left)) -
          max(var(--inline-gutter), env(safe-area-inset-right))
      );
      --rail-collapse-duration: 384ms;
      --rail-expand-duration: 520ms;
      --rail-switch-duration: 240ms;
      --rail-collapse-ease: var(--ease-in-out);
      --rail-expand-ease: cubic-bezier(0.22, 1.28, 0.36, 1);
      position: fixed;
      left: 50%;
      bottom: var(--viewport-bottom-inset);
      z-index: 50;
      display: block;
      width: var(--rail-compact-width);
      opacity: 0;
      pointer-events: none;
      transform: translateX(calc(50vw + var(--rail-size)));
      transition:
        bottom 320ms var(--ease-out),
        width var(--rail-expand-duration) var(--rail-expand-ease),
        transform var(--rail-expand-duration) var(--rail-expand-ease),
        opacity var(--dur-short) var(--ease-out);
    }

    .rail-shell {
      display: flex;
      height: var(--rail-size);
      overflow: clip;
      border: 1px solid var(--color-boundary);
      border-radius: 0.25rem;
      background-color: var(--color-paper-prime);
      flex-direction: column;
      transition: height var(--rail-expand-duration) var(--rail-expand-ease);
    }

    .rail-cells {
      position: relative;
      display: flex;
      min-width: 0;
      height: var(--rail-size);
      align-items: stretch;
    }

    .rail-cells > :global([data-rail-cell]) {
      position: relative;
      display: grid;
      min-width: 0;
      height: 100%;
      flex: 1 1 0;
      place-items: center;
      transition: opacity var(--rail-switch-duration) var(--ease-in-out);
    }

    .rail-cells > :global([data-rail-priority='secondary']) {
      transition:
        flex-grow var(--rail-expand-duration) var(--rail-expand-ease),
        opacity var(--rail-switch-duration) var(--ease-in-out);
    }

    .rail-cells > :global([data-rail-cell] + [data-rail-cell])::before {
      position: absolute;
      top: 50%;
      left: 0;
      z-index: 1;
      width: 1px;
      height: 1.25rem;
      pointer-events: none;
      content: '';
      background-color: var(--color-boundary);
      transform: translateY(-50%);
      transition: opacity var(--dur-micro) var(--ease-out);
    }

    .rail-panel {
      box-sizing: border-box;
      height: 0;
      min-height: 0;
      overflow: hidden;
      flex: none;
      border-bottom: 0 solid var(--color-boundary);
      opacity: 0;
      transition:
        height var(--rail-expand-duration) var(--rail-expand-ease),
        border-color var(--dur-micro) var(--ease-out),
        opacity var(--dur-short) var(--ease-out);
    }

    .rail-panel-content {
      min-height: 0;
      padding: 0.875rem;
      transform: translateY(0.5rem);
      transition: transform var(--rail-expand-duration)
        var(--rail-expand-ease);
    }

    .mobile-rail[data-visible='true'][data-collapsed='false'] {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(-50%);
    }

    .mobile-rail[data-visible='true'][data-collapsed='true'] {
      width: var(--rail-size);
      opacity: 1;
      pointer-events: auto;
      transform: translateX(calc(50vw - var(--rail-edge) - 100%));
      transition:
        bottom 320ms var(--ease-out),
        width var(--rail-collapse-duration) var(--rail-collapse-ease),
        transform var(--rail-collapse-duration) var(--rail-collapse-ease),
        opacity var(--dur-short) var(--ease-out);
    }

    .mobile-rail[data-collapsed='true']
      .rail-cells
      > :global([data-rail-priority='secondary']) {
      flex-grow: 0;
      flex-shrink: 0;
      overflow: clip;
      opacity: 0;
      pointer-events: none;
      transition:
        flex-grow var(--rail-collapse-duration) var(--rail-collapse-ease),
        opacity var(--rail-switch-duration) var(--ease-in-out);
    }

    @keyframes pin-compact-control {
      to {
        position: absolute;
        inset: 0;
      }
    }

    /* Pin the shared control only after the full rail has collapsed. */
    .mobile-rail[data-collapsed='true']
      .rail-cells
      > :global([data-rail-compact-control]) {
      animation: pin-compact-control 1ms step-end
        var(--rail-collapse-duration) forwards;
    }

    .mobile-rail[data-collapsed='true'][data-expanded='false'] .rail-shell {
      transition: height var(--rail-collapse-duration)
        var(--rail-collapse-ease);
    }

    .mobile-rail[data-collapsed='true'][data-expanded='false'] .rail-panel {
      transition:
        height var(--rail-collapse-duration) var(--rail-collapse-ease),
        border-color var(--dur-micro) var(--ease-out),
        opacity var(--rail-collapse-duration) var(--rail-collapse-ease);
    }

    .mobile-rail[data-collapsed='true'][data-expanded='false']
      .rail-panel-content {
      transition: transform var(--rail-collapse-duration)
        var(--rail-collapse-ease);
    }

    .mobile-rail[data-collapsed='true']
      .rail-cells
      > :global([data-rail-priority='primary']) {
      flex-grow: 1;
    }

    .mobile-rail[data-collapsed='true']
      .rail-cells
      > :global([data-rail-cell])::before {
      opacity: 0;
    }

    .mobile-rail[data-expanded='true'] {
      width: var(--rail-expanded-width);
    }

    .mobile-rail[data-expanded='true'] .rail-shell {
      height: calc(var(--rail-size) + var(--rail-panel-height) + 1px);
    }

    .mobile-rail[data-expanded='true'] .rail-panel {
      height: calc(var(--rail-panel-height) + 1px);
      border-bottom-width: 1px;
      opacity: 1;
    }

    .mobile-rail[data-expanded='true'] .rail-panel-content {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mobile-rail,
    .rail-shell,
    .rail-panel,
    .rail-panel-content,
    .rail-cells > :global([data-rail-cell]),
    .rail-cells > :global([data-rail-cell])::before {
      transition-duration: 1ms;
    }

    .rail-cells > :global([data-rail-compact-control]) {
      animation-duration: 1ms;
      animation-delay: 0ms;
    }
  }
</style>
