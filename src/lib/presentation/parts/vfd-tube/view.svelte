<script lang="ts">
  import Wordmark from './parts/wordmark.svelte'

  interface Props {
    active: boolean
    color: string
    readout: string
  }

  /* oxlint-disable prefer-const -- Observatory pulse props update with the stage. */
  let { active, color, readout }: Props = $props()
</script>

<div class="tube-layer" style:--signal={color}>
  <Wordmark {active} {readout} />
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
