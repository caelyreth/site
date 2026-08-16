<script lang="ts">
  /* oxlint-disable prefer-const -- Stage props can update with their host. */
  import plana_figure_source from '$lib/assets/illustrations/plana-figure.svg?raw'
  import type { StageProps } from '$lib/presentation/contract'
  import SiteMark from '$lib/presentation/parts/site-mark/view.svelte'
  import VfdTube from '$lib/presentation/parts/vfd-tube/view.svelte'
  import SkyMapSurface from '$lib/presentation/surfaces/sky-map/view.svelte'
  import StageIntro from '$lib/site/stage-intro.svelte'

  const plana_palette = [
    ['#fafafa', '--plana-tone-0'],
    ['#f7f6f7', '--plana-tone-1'],
    ['#e3dddf', '--plana-tone-2'],
    ['#bfb3b6', '--plana-tone-3'],
    ['#7d767a', '--plana-tone-4'],
    ['#323033', '--plana-tone-5'],
    ['#201f22', '--plana-tone-6'],
    ['#161517', '--plana-tone-7'],
  ] as const

  function recolor_plana(clip_id: string) {
    let figure = plana_figure_source
      .replaceAll('url(#a)', `url(#${clip_id})`)
      .replace('id="a"', `id="${clip_id}"`)
    for (const [source, tone] of plana_palette) {
      figure = figure.replaceAll(source, `var(${tone})`)
    }
    return figure
  }

  const plana_far = recolor_plana('plana-far-clip')
  const plana_near = recolor_plana('plana-near-clip')
  const plana_interference = recolor_plana('plana-interference-clip')

  let { intro, motion }: StageProps = $props()
</script>

<div class="observatory-stage">
  <SkyMapSurface deferred={motion?.defer_surface ?? false} />
  <SiteMark />
  <div aria-hidden="true" class="plana-art plana-far">
    <div class="plana-figure">{@html plana_far}</div>
  </div>
  <div aria-hidden="true" class="plana-art plana-near">
    <div class="plana-figure">{@html plana_near}</div>
    <div class="plana-figure plana-interference">
      {@html plana_interference}
    </div>
  </div>
  <div class="intro-cluster">
    <div aria-hidden="true" class="cabin-plate">
      <span class="micro-label">Port / 01</span>
    </div>
    <VfdTube />
    <nav aria-label="Caelyreth links" class="social-links">
      <a
        href="https://github.com/caelyreth"
        rel="me noopener noreferrer"
        target="_blank"
      >
        <span class="i-ri-github-line" aria-hidden="true"></span>
        <span>GitHub</span>
        <span class="i-ri-arrow-up-right-line" aria-hidden="true"></span>
      </a>
      <span aria-hidden="true" class="social-preview">
        <span class="i-ri-sparkling-line"></span>
        <span>Bluesky</span>
      </span>
      <span aria-hidden="true" class="social-preview">
        <span class="i-ri-chat-3-line"></span>
        <span>Mastodon</span>
      </span>
    </nav>
    <StageIntro description={intro.description} />
  </div>
</div>

<style>
  .observatory-stage {
    --stage-label-safe-left: max(
      clamp(0.75rem, 4vw, var(--inline-gutter)),
      env(safe-area-inset-left)
    );
    --stage-label-safe-right: max(
      clamp(0.75rem, 4vw, var(--inline-gutter)),
      env(safe-area-inset-right)
    );
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .plana-art {
    --plana-normal-inline-start: clamp(3.5rem, 17vw, 19rem);
    --plana-normal-width: clamp(23rem, 48vw, 48rem);
    --plana-final-inline-start: max(
      0px,
      calc(min(100vw, var(--frame-measure)) - var(--plana-normal-width))
    );

    position: absolute;
    bottom: clamp(-3rem, -3vw, -1.25rem);
    left: calc(
      var(--plana-final-inline-start) +
        (
          var(--plana-normal-inline-start) - var(--plana-final-inline-start)
        ) *
        var(--stage-opening)
    );
    width: var(--plana-normal-width);
    max-width: none;
    pointer-events: none;
    user-select: none;
    display: block;
    animation: plana-materialize 900ms var(--ease-out) both;
  }

  .plana-figure {
    display: block;
    width: 100%;
    height: auto;
  }

  .plana-figure :global(svg) {
    display: block;
    width: 100%;
    max-height: min(94%, 54rem);
    height: auto;
  }

  .plana-interference {
    position: absolute;
    inset: 0;
    width: 100%;
    max-height: none;
    height: 100%;
    opacity: 0;
    filter: brightness(1.18) contrast(1.08);
    clip-path: inset(45% 0);
  }

  .plana-interference :global(svg) {
    max-height: none;
    height: 100%;
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
        plana-boot-scan 900ms steps(1, end) both,
        plana-interference 7.5s 1.2s steps(1, end) infinite;
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

  .intro-cluster {
    --stage-intro-description-measure: 34rem;
    --stage-intro-entry-gap: 0.75rem;
    --vfd-inline-offset: clamp(-1.25rem, -1.5vw, -0.75rem);

    position: absolute;
    bottom: var(--stage-intro-bottom-inset);
    left: var(--stage-intro-inline-inset);
    z-index: 5;
    display: grid;
    width: min(42rem, calc(100% - 2 * var(--stage-intro-inline-inset)));
    gap: clamp(0.5rem, 1vw, 0.75rem);
  }

  .cabin-plate {
    display: flex;
    width: min(37vw, 28rem);
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-stage-ink-secondary);
    opacity: 0.72;
  }

  .cabin-plate::before {
    width: 1px;
    height: 0.7rem;
    flex: none;
    content: '';
    background: var(--color-boundary);
  }

  .cabin-plate::after {
    height: 1px;
    flex: 1;
    content: '';
    background: var(--color-boundary);
  }

  .cabin-plate .micro-label {
    letter-spacing: 0.12em;
  }

  .social-links {
    display: flex;
    min-height: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
  }

  :global(html:not(.dark))
    .intro-cluster
    :global(.stage-intro .description) {
    box-sizing: border-box;
    background-color: var(--color-stage-ink);
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    padding-block: 0.1em;
    box-shadow:
      -0.375rem 0 var(--color-stage-ink),
      0.375rem 0 var(--color-stage-ink);
    color: var(--color-paper-light);
    line-height: 1.15;
  }

  .social-links a,
  .social-preview {
    position: relative;
    display: inline-flex;
    min-height: 1.5rem;
    padding: 0.0625rem 0 0.4375rem;
    color: var(--color-stage-ink-secondary);
    font-size: 0.625rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1.15;
    align-items: center;
    gap: 0.4375rem;
  }

  .social-links a {
    text-decoration: none;
    transition:
      color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .social-links a::after,
  .social-preview::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      currentcolor 0 calc(100% - 0.75rem),
      transparent calc(100% - 0.75rem) calc(100% - 0.5rem),
      currentcolor calc(100% - 0.5rem)
    );
    content: '';
  }

  .social-links a > :first-child,
  .social-preview > :first-child {
    font-size: 0.8125rem;
  }

  .social-links a > :last-child {
    margin-left: 0.0625rem;
    font-size: 0.75rem;
  }

  .social-preview {
    color: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 68%,
      transparent
    );
    pointer-events: none;
  }

  .social-links a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  @media (hover: hover) {
    .social-links a:hover {
      color: var(--color-stage-ink);
      transform: translateY(-1px);
    }
  }

  @media (max-width: 40rem) {
    .intro-cluster {
      --stage-intro-description-measure: 21rem;
      --stage-intro-entry-gap: 0.625rem;
      --vfd-inline-offset: -0.75rem;

      gap: 0.5rem;
    }

    .plana-art {
      display: none;
    }

    .cabin-plate {
      width: min(72vw, 25rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .plana-art {
      animation: none;
    }

    .plana-interference {
      display: none;
    }

    .social-links a {
      transform: none;
      transition: none;
    }
  }
</style>
