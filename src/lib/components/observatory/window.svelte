<figure class="window" aria-label="Observatory placeholder studies">
  <div aria-hidden="true" class="strips">
    <div class="strip study-one"></div>
    <div class="strip study-two"></div>
    <div class="strip study-three"></div>
    <div class="strip study-four"></div>
  </div>
</figure>

<style>
  .window {
    width: 100%;
    margin: 0;
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
</style>
