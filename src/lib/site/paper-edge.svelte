<script lang="ts">
  interface Props {
    guide?: boolean
    side: 'top' | 'bottom'
  }

  const { guide = false, side }: Props = $props()
  const points = Array.from(
    { length: 51 },
    (_, index) => `${index * 2},${index % 2 === 0 ? 0 : 8}`,
  ).join(' ')
</script>

<div
  aria-hidden="true"
  class:has-guide={guide}
  class:top={side === 'top'}
  class:bottom={side === 'bottom'}
  class="paper-edge"
>
  {#if guide}<div class="guide"></div>{/if}
  <svg viewBox="0 0 100 8" preserveAspectRatio="none">
    <polyline {points} fill="none" stroke="currentColor" />
  </svg>
</div>

<style>
  .paper-edge {
    position: absolute;
    z-index: 2;
    left: 0;
    width: 100%;
    height: var(--paper-edge-depth);
    pointer-events: none;
  }

  .paper-edge.has-guide {
    height: var(--paper-seam-upper-height);
  }

  .paper-edge.has-guide.bottom {
    bottom: 0;
  }

  .top {
    top: 0.5px;
  }

  .bottom {
    bottom: 0.5px;
  }

  svg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--paper-edge-depth);
    color: var(--color-rule);
  }

  .paper-edge.has-guide.bottom svg {
    bottom: 0.5px;
  }

  polyline {
    vector-effect: non-scaling-stroke;
    stroke-width: 1.5;
  }

  .guide {
    position: absolute;
    right: var(--paper-seam-guide-inset);
    bottom: calc(var(--paper-edge-depth) + var(--paper-seam-guide-offset));
    left: var(--paper-seam-guide-inset);
    z-index: 1;
    height: 1px;
    background-image: repeating-linear-gradient(
      to right,
      var(--color-rule) 0 0.25rem,
      transparent 0.25rem 0.5rem
    );
  }
</style>
