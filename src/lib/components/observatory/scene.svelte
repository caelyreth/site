<script lang="ts">
  import Window from './window.svelte'
</script>

<section class="scene" aria-labelledby="scene-label">
  <div class="stage">
    <p id="scene-label" class="label">Caelyreth / Observatory</p>
    <Window />
    <p class="label label-end">Observation window / Placeholder studies</p>
  </div>
</section>

<style>
  .scene {
    position: relative;
    width: 100vw;
    min-height: clamp(24rem, 70svh, 42rem);
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
    border-block: 1px solid var(--color-rule);
    background-color: var(--color-paper-prime);
  }

  .stage {
    position: relative;
    display: grid;
    width: min(100%, var(--frame-measure));
    min-height: inherit;
    margin-inline: auto;
    padding: 1.25rem var(--inline-gutter);
    grid-template-rows: auto minmax(0, 1fr) auto;
  }

  .stage :global(.window) {
    align-self: center;
  }

  .label {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .label-end {
    text-align: right;
  }

  @media (max-width: 38rem) {
    .scene {
      min-height: 24rem;
    }

    .stage {
      padding-block: 1rem;
    }
  }
</style>
