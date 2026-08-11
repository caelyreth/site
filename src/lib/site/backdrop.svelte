<script lang="ts">
  import Guide from './guide.svelte'
</script>

<div aria-hidden="true" class="hatch"></div>
<Guide side="left" />
<Guide side="right" />

<style>
  .hatch {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .hatch::before,
  .hatch::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
  }

  .hatch::before {
    opacity: var(--noise-hatch-opacity);
    background-image: var(--noise-tile);
    background-size: var(--noise-hatch-size);
  }

  .hatch::after {
    background-image: repeating-linear-gradient(
      -55deg,
      transparent 0 7px,
      var(--color-hatch) 7px 8px
    );
  }
</style>
