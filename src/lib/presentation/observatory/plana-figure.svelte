<script lang="ts">
  import { plana_layers } from './plana-asset'
</script>

<div aria-hidden="true" class="plana-position">
  <div class="plana-art plana-far">
    <div class="plana-figure">{@html plana_layers.far}</div>
  </div>
  <div class="plana-art plana-near">
    <div class="plana-figure">{@html plana_layers.near}</div>
    <div class="plana-figure plana-interference">
      {@html plana_layers.interference}
    </div>
  </div>
</div>

<style>
  .plana-position {
    --plana-materialize-delay: 420ms;
    --plana-figure-aspect-ratio: 0.885;
    --plana-normal-inline-start: clamp(3.5rem, 17vw, 19rem);
    --plana-normal-width: clamp(23rem, 48vw, 48rem);
    --plana-art-height: min(
      54rem,
      calc(
        (
            var(--stage-viewport) - var(--stage-top) -
              var(--stage-frame-inset)
          ) *
          0.94
      )
    );
    --plana-render-width: min(
      var(--plana-normal-width),
      calc(var(--plana-art-height) * var(--plana-figure-aspect-ratio))
    );
    --plana-final-inline-start: max(
      0px,
      calc(min(100vw, var(--frame-measure)) - var(--plana-normal-width))
    );
    --plana-inline-shift: calc(
      var(--plana-final-inline-start) +
        (
          var(--plana-normal-inline-start) - var(--plana-final-inline-start)
        ) *
        var(--stage-opening)
    );

    position: absolute;
    bottom: clamp(-3rem, -3vw, -1.25rem);
    left: 0;
    width: var(--plana-normal-width);
    height: var(--plana-art-height);
    pointer-events: none;
    user-select: none;
  }

  .plana-art {
    position: absolute;
    bottom: 0;
    left: 0;
    width: var(--plana-render-width);
    height: var(--plana-art-height);
    display: block;
    animation: plana-materialize 900ms var(--ease-out)
      var(--plana-materialize-delay) both;
    translate: var(--plana-inline-shift) 0;
    will-change: transform, translate;
  }

  .plana-figure {
    display: block;
    width: 100%;
    height: 100%;
  }

  .plana-figure :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .plana-interference {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    filter: brightness(1.18) contrast(1.08);
    clip-path: inset(45% 0);
  }

  .plana-far {
    --plana-tone-0: color-mix(
      in oklab,
      var(--color-stage-surface) 98%,
      var(--color-stage-ink)
    );
    --plana-tone-1: color-mix(
      in oklab,
      var(--color-stage-surface) 95%,
      var(--color-stage-ink)
    );
    --plana-tone-2: color-mix(
      in oklab,
      var(--color-stage-surface) 87%,
      var(--color-stage-ink)
    );
    --plana-tone-3: color-mix(
      in oklab,
      var(--color-stage-surface) 72%,
      var(--color-stage-ink)
    );
    --plana-tone-4: color-mix(
      in oklab,
      var(--color-stage-surface) 57%,
      var(--color-stage-ink)
    );
    --plana-tone-5: color-mix(
      in oklab,
      var(--color-stage-surface) 43%,
      var(--color-stage-ink)
    );
    --plana-tone-6: color-mix(
      in oklab,
      var(--color-stage-surface) 32%,
      var(--color-stage-ink)
    );
    --plana-tone-7: color-mix(
      in oklab,
      var(--color-stage-surface) 25%,
      var(--color-stage-ink)
    );

    z-index: 1;
  }

  .plana-near {
    --plana-tone-0: color-mix(
      in oklab,
      var(--color-stage-surface) 96%,
      var(--color-stage-ink)
    );
    --plana-tone-1: color-mix(
      in oklab,
      var(--color-stage-surface) 91%,
      var(--color-stage-ink)
    );
    --plana-tone-2: color-mix(
      in oklab,
      var(--color-stage-surface) 79%,
      var(--color-stage-ink)
    );
    --plana-tone-3: color-mix(
      in oklab,
      var(--color-stage-surface) 59%,
      var(--color-stage-ink)
    );
    --plana-tone-4: color-mix(
      in oklab,
      var(--color-stage-surface) 41%,
      var(--color-stage-ink)
    );
    --plana-tone-5: color-mix(
      in oklab,
      var(--color-stage-surface) 23%,
      var(--color-stage-ink)
    );
    --plana-tone-6: color-mix(
      in oklab,
      var(--color-stage-surface) 15%,
      var(--color-stage-ink)
    );
    --plana-tone-7: color-mix(
      in oklab,
      var(--color-stage-surface) 11%,
      var(--color-stage-ink)
    );

    z-index: 3;
    -webkit-mask-image: linear-gradient(
      to right,
      #000 0 54%,
      rgb(0 0 0 / 0.82) 68%,
      transparent 84%
    );
    -webkit-mask-repeat: no-repeat;
    mask-image: linear-gradient(
      to right,
      #000 0 54%,
      rgb(0 0 0 / 0.82) 68%,
      transparent 84%
    );
    mask-repeat: no-repeat;
  }

  :global(.dark) .plana-far {
    --plana-tone-0: color-mix(
      in oklab,
      var(--color-stage-surface) 50%,
      var(--color-stage-ink)
    );
    --plana-tone-1: color-mix(
      in oklab,
      var(--color-stage-surface) 54%,
      var(--color-stage-ink)
    );
    --plana-tone-2: color-mix(
      in oklab,
      var(--color-stage-surface) 62%,
      var(--color-stage-ink)
    );
    --plana-tone-3: color-mix(
      in oklab,
      var(--color-stage-surface) 72%,
      var(--color-stage-ink)
    );
    --plana-tone-4: color-mix(
      in oklab,
      var(--color-stage-surface) 83%,
      var(--color-stage-ink)
    );
    --plana-tone-5: color-mix(
      in oklab,
      var(--color-stage-surface) 91%,
      var(--color-stage-ink)
    );
    --plana-tone-6: color-mix(
      in oklab,
      var(--color-stage-surface) 96%,
      var(--color-stage-ink)
    );
    --plana-tone-7: color-mix(
      in oklab,
      var(--color-stage-surface) 98%,
      var(--color-stage-ink)
    );
  }

  :global(.dark) .plana-near {
    --plana-tone-0: color-mix(
      in oklab,
      var(--color-stage-surface) 43%,
      var(--color-stage-ink)
    );
    --plana-tone-1: color-mix(
      in oklab,
      var(--color-stage-surface) 46%,
      var(--color-stage-ink)
    );
    --plana-tone-2: color-mix(
      in oklab,
      var(--color-stage-surface) 54%,
      var(--color-stage-ink)
    );
    --plana-tone-3: color-mix(
      in oklab,
      var(--color-stage-surface) 66%,
      var(--color-stage-ink)
    );
    --plana-tone-4: color-mix(
      in oklab,
      var(--color-stage-surface) 78%,
      var(--color-stage-ink)
    );
    --plana-tone-5: color-mix(
      in oklab,
      var(--color-stage-surface) 88%,
      var(--color-stage-ink)
    );
    --plana-tone-6: color-mix(
      in oklab,
      var(--color-stage-surface) 93%,
      var(--color-stage-ink)
    );
    --plana-tone-7: color-mix(
      in oklab,
      var(--color-stage-surface) 97%,
      var(--color-stage-ink)
    );
  }

  @keyframes plana-materialize {
    0% {
      opacity: 0;
      transform: translateY(0.25rem);
      filter: blur(0.75px) brightness(1.08);
    }
    28% {
      opacity: 0.38;
      transform: translateY(0.125rem);
      filter: blur(0.35px) brightness(1.14) contrast(1.04);
    }
    62% {
      opacity: 0.74;
      transform: translateY(0.0625rem);
      filter: brightness(1.24) contrast(1.08);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      filter: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .plana-interference {
      animation:
        plana-boot-scan 900ms var(--plana-materialize-delay) steps(1, end)
          both,
        plana-interference 7.5s calc(var(--plana-materialize-delay) + 1.2s)
          steps(1, end) infinite;
    }
  }

  @keyframes plana-boot-scan {
    0% {
      opacity: 0;
      transform: translateX(0);
      filter: brightness(1.18) contrast(1.08);
      clip-path: inset(45% 0 47%);
    }
    18% {
      opacity: 0.36;
      transform: translateX(0.18rem);
      filter: brightness(1.3) contrast(1.12);
      clip-path: inset(15% 0 79%);
    }
    37% {
      opacity: 0.16;
      transform: translateX(-0.1rem);
      clip-path: inset(50% 0 43%);
    }
    58% {
      opacity: 0.3;
      transform: translateX(-0.22rem);
      filter: brightness(1.26) contrast(1.1);
      clip-path: inset(74% 0 19%);
    }
    78% {
      opacity: 0.14;
      transform: translateX(0.08rem);
      clip-path: inset(34% 0 59%);
    }
    100% {
      opacity: 0;
      transform: translateX(0);
      filter: brightness(1.18) contrast(1.08);
      clip-path: inset(45% 0 47%);
    }
  }

  @keyframes plana-interference {
    0%,
    72%,
    100% {
      opacity: 0;
      transform: translateX(0);
      filter: brightness(1.18) contrast(1.08);
      clip-path: inset(45% 0);
    }
    74% {
      opacity: 0.44;
      transform: translateX(0.55rem);
      filter: brightness(1.3) contrast(1.12);
      clip-path: inset(16% 0 79%);
    }
    76.5% {
      opacity: 0.08;
      transform: translateX(-0.1rem);
      clip-path: inset(16% 0 79%);
    }
    78.5% {
      opacity: 0.54;
      transform: translateX(-0.7rem);
      filter: brightness(1.34) contrast(1.15);
      clip-path: inset(45% 0 47%);
    }
    80.5% {
      opacity: 0.3;
      transform: translateX(0.35rem);
      filter: brightness(1.24) contrast(1.1);
      clip-path: inset(75% 0 19%);
    }
    82% {
      opacity: 0;
      transform: translateX(0);
      clip-path: inset(75% 0 19%);
    }
  }

  @media (max-width: 40rem) {
    .plana-art {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .plana-art {
      animation: none;
    }

    .plana-interference {
      display: none;
    }
  }
</style>
