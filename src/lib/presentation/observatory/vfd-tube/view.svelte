<script lang="ts">
  import Wordmark from './wordmark.svelte'
</script>

<div class="tube-layer">
  <div aria-hidden="true" class="tube-glass"></div>
  <div class="tube-wordmark">
    <Wordmark readout="DEEP*VOID" />
  </div>
</div>

<style>
  .tube-layer {
    width: min(39vw, 29rem);
    aspect-ratio: 68.4 / 22.2;
    margin-inline-start: var(--vfd-inline-offset, 0px);
    pointer-events: none;
    position: relative;
    user-select: none;
  }

  .tube-glass {
    position: absolute;
    inset: 13.4% 7.3% 13.2% 4.7%;
    z-index: 0;
    border-radius: 0.2rem;
    background-color: color-mix(
      in oklab,
      var(--color-stage-glass-surface) 72%,
      transparent
    );
    background-image: linear-gradient(
      135deg,
      color-mix(in oklab, var(--color-paper) 14%, transparent),
      transparent 58%
    );
  }

  .tube-wordmark {
    position: relative;
    z-index: 1;
  }

  @media (width < 38rem) {
    .tube-layer {
      width: min(76vw, 26rem);
    }
  }
</style>
