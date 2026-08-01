<script lang="ts">
  // make svelte lsp happy
</script>

<figure class="window" aria-label="Observatory placeholder studies">
  <div class="frame">
    <div aria-hidden="true" class="strips">
      <div class="strip study-one"></div>
      <div class="strip study-two"></div>
      <div class="strip study-three"></div>
      <div class="strip study-four"></div>
    </div>
    <span aria-hidden="true" class="tick tick-top-left"></span>
    <span aria-hidden="true" class="tick tick-top-right"></span>
    <span aria-hidden="true" class="tick tick-bottom-left"></span>
    <span aria-hidden="true" class="tick tick-bottom-right"></span>
  </div>
</figure>

<style>
  .window {
    width: 100%;
    margin: 0;
  }

  .frame {
    position: relative;
    animation: window-expand 640ms var(--ease-in-out-medium) 880ms both;
  }

  .strips {
    display: grid;
    width: 100%;
    aspect-ratio: 7 / 3.7;
    gap: clamp(0.5rem, 1.5vw, 1rem);
    grid-template-columns: 2.5fr 4fr 2fr 1fr;
  }

  .strip {
    min-width: 0;
    clip-path: inset(0 100% 0 0);
    animation: strip-reveal 640ms var(--ease-in-out) both;
  }

  .strip:nth-child(2) {
    animation-delay: 120ms;
  }

  .strip:nth-child(3) {
    animation-delay: 240ms;
  }

  .strip:nth-child(4) {
    animation-delay: 360ms;
  }

  .tick {
    position: absolute;
    width: 0.75rem;
    height: 0.75rem;
    pointer-events: none;
    border: 0 solid var(--color-rule);
  }

  .tick-top-left {
    top: -0.375rem;
    left: -0.375rem;
    border-top-width: 1px;
    border-left-width: 1px;
  }

  .tick-top-right {
    top: -0.375rem;
    right: -0.375rem;
    border-top-width: 1px;
    border-right-width: 1px;
  }

  .tick-bottom-left {
    bottom: -0.375rem;
    left: -0.375rem;
    border-bottom-width: 1px;
    border-left-width: 1px;
  }

  .tick-bottom-right {
    right: -0.375rem;
    bottom: -0.375rem;
    border-right-width: 1px;
    border-bottom-width: 1px;
  }

  .study-one {
    background-color: oklch(71% 0.035 230);
  }

  .study-two {
    background-color: oklch(66% 0.04 273);
  }

  .study-three {
    background-color: oklch(74% 0.035 108);
  }

  .study-four {
    background-color: oklch(61% 0.03 25);
  }

  :global(.dark) .study-one {
    background-color: oklch(43% 0.035 230);
  }

  :global(.dark) .study-two {
    background-color: oklch(39% 0.04 273);
  }

  :global(.dark) .study-three {
    background-color: oklch(46% 0.035 108);
  }

  :global(.dark) .study-four {
    background-color: oklch(37% 0.03 25);
  }

  @media (prefers-reduced-motion: reduce) {
    .frame {
      animation: none;
    }

    .strip {
      clip-path: none;
      animation: none;
    }
  }

  @keyframes strip-reveal {
    to {
      clip-path: inset(0);
    }
  }

  @keyframes window-expand {
    from {
      transform: scale(0.42);
    }
  }
</style>
