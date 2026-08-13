<script lang="ts">
  import Wordmark from './parts/wordmark.svelte'

  interface Props {
    active: boolean
    color: string
  }

  /* oxlint-disable prefer-const -- Observatory pulse props update with the stage. */
  let { active, color }: Props = $props()
</script>

<div class="tube-layer" style:--signal={color}>
  <Wordmark {active} />
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
