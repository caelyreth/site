<script lang="ts">
  import bottom_mask from '$lib/assets/paper-edge-bottom-mask.svg'
  import top_mask from '$lib/assets/paper-edge-top-mask.svg'

  interface Props {
    guide?: boolean
    side: 'top' | 'bottom'
  }

  const { guide = false, side }: Props = $props()
  const edge_width = 24
  const edge_depth = 12
  const edge_peak = edge_width / 2
  const pattern_id = $props.id()
  const outline_id = `${pattern_id}-outline`
  const edge_mask = $derived(side === 'top' ? top_mask : bottom_mask)
</script>

<div
  aria-hidden="true"
  class="paper-edge"
  style:--edge-mask={`url("${edge_mask}")`}
  style:--edge-width={`${edge_width}px`}
>
  {#if guide}<div class="guide"></div>{/if}
  <svg aria-hidden="true" class="fill-shape" focusable="false">
    <defs>
      <pattern
        height={edge_depth}
        id={pattern_id}
        patternUnits="userSpaceOnUse"
        width={edge_width}
      >
        {#if side === 'top'}
          <path
            class="fill"
            d={`M0 0 ${edge_peak} ${edge_depth} ${edge_width} 0v${edge_depth}H0z`}
          />
        {:else}
          <path
            class="fill"
            d={`M0 0h${edge_width}L${edge_peak} ${edge_depth}z`}
          />
        {/if}
      </pattern>
    </defs>
    <rect fill={`url(#${pattern_id})`} height="100%" width="100%" />
  </svg>
  <svg aria-hidden="true" class="outline-shape" focusable="false">
    <defs>
      <pattern
        height={edge_depth}
        id={outline_id}
        patternUnits="userSpaceOnUse"
        width={edge_width}
      >
        <path
          class="outline"
          d={`M0 0 ${edge_peak} ${edge_depth} ${edge_width} 0`}
        />
      </pattern>
    </defs>
    <rect fill={`url(#${outline_id})`} height="100%" width="100%" />
  </svg>
</div>

<style>
  .paper-edge {
    position: relative;
    z-index: 2;
    display: block;
    width: 100%;
    height: var(--paper-edge-depth);
    flex: none;
    color: var(--paper-edge-surface, var(--color-paper));
    pointer-events: none;
  }

  svg {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .fill-shape {
    z-index: 0;
  }

  .paper-edge::before {
    position: absolute;
    inset: 0;
    z-index: 1;
    content: '';
    opacity: var(--noise-content-opacity);
    background-image: var(--noise-tile);
    background-position: center;
    background-size: var(--noise-size);
    -webkit-mask-image: var(--edge-mask);
    -webkit-mask-position: left top;
    -webkit-mask-repeat: repeat-x;
    -webkit-mask-size: var(--edge-width) var(--paper-edge-depth);
    mask-image: var(--edge-mask);
    mask-position: left top;
    mask-repeat: repeat-x;
    mask-size: var(--edge-width) var(--paper-edge-depth);
  }

  .outline-shape {
    z-index: 2;
  }

  .guide {
    position: absolute;
    right: var(--paper-seam-guide-inset);
    bottom: calc(100% + var(--paper-seam-guide-offset));
    left: var(--paper-seam-guide-inset);
    z-index: 3;
    height: 1px;
    background-image: var(--paper-seam-dash);
  }

  .fill {
    fill: currentColor;
  }

  .outline {
    fill: none;
    stroke: var(--color-boundary);
    stroke-linecap: square;
    stroke-linejoin: bevel;
    stroke-width: 1.5;
  }
</style>
