<script lang="ts">
  import type { ForegroundProps } from '$lib/presentation/contract'

  import Wordmark from './parts/wordmark.svelte'

  /* oxlint-disable prefer-const -- Signal props update with the background. */
  let { signal }: ForegroundProps = $props()
</script>

<div class="tube-layer">
  <Wordmark active={signal !== undefined} />
</div>

<style>
  .tube-layer {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    width: min(64vw, 40rem);
    pointer-events: none;
    transform: translate(-50%, -50%)
      scale(calc(1 - var(--stage-progress) * 0.12));
    transform-origin: center;
    will-change: transform;
  }

  @media (max-width: 38rem) {
    .tube-layer {
      width: min(84vw, 30rem);
    }
  }
</style>
