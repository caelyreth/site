<script lang="ts">
  import Wordmark from './parts/wordmark.svelte'
</script>

<div class="tube-layer">
  <Wordmark readout="DEEP FIELD" />
</div>

<style>
  .tube-layer {
    width: min(37vw, 28rem);
    margin-inline-start: var(--vfd-inline-offset, 0px);
    pointer-events: none;
  }

  @media (max-width: 38rem) {
    .tube-layer {
      width: min(72vw, 25rem);
    }
  }
</style>
