<script lang="ts">
  import Window from './window.svelte'
</script>

<section class="scene" aria-labelledby="scene-label">
  <div class="stage">
    <div class="edge">
      <p id="scene-label" class="label">Caelyreth / Observatory</p>
      <p class="label label-detail">Field 044 deg 12 min</p>
    </div>
    <Window />
    <div class="edge">
      <p class="label">Transmission 001</p>
      <a class="label descent" href="#station">Descend to station</a>
    </div>
  </div>
</section>

<style>
  .scene {
    position: relative;
    width: 100vw;
    min-height: 100svh;
    min-height: 100dvh;
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
    border-block: 1px solid var(--color-rule);
    background-color: var(--color-paper-prime);
  }

  .scene::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: 0.25;
    background-image: var(--noise-tile);
    background-size: 96px;
  }

  .stage {
    position: relative;
    z-index: 1;
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

  .edge {
    display: flex;
    min-width: 0;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
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

  .label-detail,
  .descent {
    text-align: right;
  }

  .descent {
    color: var(--color-muted);
    text-decoration-color: var(--color-rule);
    text-underline-offset: 0.15em;
    transition:
      color var(--dur-micro) var(--ease-out),
      text-decoration-color var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .descent:hover {
      color: var(--color-accent);
      text-decoration-color: var(--color-accent);
    }
  }

  @media (max-width: 38rem) {
    .label-detail {
      display: none;
    }

    .stage {
      padding-block: 1rem;
    }
  }
</style>
