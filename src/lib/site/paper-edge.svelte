<script lang="ts">
  interface Props {
    side: 'top' | 'bottom'
  }

  const { side }: Props = $props()
  const points = Array.from(
    { length: 51 },
    (_, index) => `${index * 2},${index % 2 === 0 ? 0 : 8}`,
  ).join(' ')
</script>

<svg
  aria-hidden="true"
  class:top={side === 'top'}
  class:bottom={side === 'bottom'}
  class="paper-edge"
  viewBox="0 0 100 8"
  preserveAspectRatio="none"
>
  <polyline {points} fill="none" stroke="currentColor" />
</svg>

<style>
  .paper-edge {
    position: absolute;
    z-index: 2;
    left: 0;
    width: 100%;
    height: var(--paper-edge-depth);
    color: var(--color-rule);
    pointer-events: none;
  }

  .top {
    top: 0.5px;
  }

  .bottom {
    bottom: 0.5px;
  }

  polyline {
    vector-effect: non-scaling-stroke;
    stroke-width: 1.5;
  }
</style>
