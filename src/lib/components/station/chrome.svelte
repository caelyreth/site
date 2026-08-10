<script lang="ts">
  import Boundary from './boundary.svelte'
</script>

<div aria-hidden="true" class="hatch"></div>
<Boundary side="left" />
<Boundary side="right" />

<style>
  .hatch {
    --noise-size: 128px;

    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image:
      repeating-linear-gradient(
        -55deg,
        transparent 0 7px,
        var(--color-hatch) 7px 8px
      ),
      var(--noise-tile);
    background-size: auto, var(--noise-size);
  }
</style>
