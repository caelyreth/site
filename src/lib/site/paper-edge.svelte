<script lang="ts">
  interface Props {
    guide?: boolean
    side: 'top' | 'bottom'
  }

  const { guide = false, side }: Props = $props()
  const pattern_id = $props.id()
</script>

<div aria-hidden="true" class="paper-edge">
  {#if guide}<div class="guide"></div>{/if}
  <svg aria-hidden="true" focusable="false">
    <defs>
      <pattern
        height="14"
        id={pattern_id}
        patternUnits="userSpaceOnUse"
        width="16"
      >
        {#if side === 'top'}
          <path class="fill" d="M0 0 8 14 16 0v14H0z" />
        {:else}
          <path class="fill" d="M0 0h16L8 14z" />
        {/if}
        <path class="outline" d="M0 0 8 14 16 0" />
      </pattern>
    </defs>
    <rect fill={`url(#${pattern_id})`} height="100%" width="100%" />
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
    display: block;
    width: 100%;
    height: 100%;
  }

  .guide {
    position: absolute;
    right: var(--paper-seam-guide-inset);
    bottom: calc(100% + var(--paper-seam-guide-offset));
    left: var(--paper-seam-guide-inset);
    z-index: 1;
    height: 1px;
    background-image: repeating-linear-gradient(
      to right,
      var(--color-rule) 0 0.25rem,
      transparent 0.25rem 0.5rem
    );
  }

  .fill {
    fill: currentColor;
  }

  .outline {
    fill: none;
    stroke: var(--color-rule);
    stroke-linecap: square;
    stroke-linejoin: bevel;
    stroke-width: 1.5;
  }
</style>
