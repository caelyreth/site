<script lang="ts">
  import { base } from '$app/paths'

  const starTile = `url('${base}/star-tile.webp')`
</script>

<div aria-hidden="true" class="star-field" style:--star-tile={starTile}>
  <span class="layer layer-far"></span>
  <span class="layer layer-near"></span>
</div>

<style>
  .star-field {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: max(0, calc(1 - var(--p, 0) * 1.25));
  }

  .layer {
    position: absolute;
    inset: 0;
    background-image: var(--star-tile);
    background-repeat: repeat;
    filter: invert(1);
  }

  .layer-far {
    background-size: 384px;
    opacity: 0.11;
  }

  .layer-near {
    background-size: 256px;
    opacity: 0.24;
  }

  :global(.dark) .layer {
    filter: none;
  }

  :global(.dark) .layer-far {
    opacity: 0.22;
  }

  :global(.dark) .layer-near {
    opacity: 0.48;
  }

  @media (prefers-reduced-motion: reduce) {
    .star-field {
      opacity: max(0, calc(0.72 - var(--p, 0) * 1.05));
    }
  }
</style>
