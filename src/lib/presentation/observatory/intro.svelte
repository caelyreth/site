<script lang="ts">
  import StageIntro from '$lib/components/layout/stage-intro.svelte'
  import type { HomeFrontmatter } from '$lib/content/schema'

  import Wordmark from './vfd-tube/wordmark.svelte'

  interface Props {
    description?: string
    observatory: HomeFrontmatter['observatory']
  }

  let { description, observatory }: Props = $props()
</script>

<div class="intro-cluster">
  <div aria-hidden="true" class="cabin-plate" data-nosnippet="">
    <span class="micro-label">{observatory.cabin_label}</span>
  </div>
  <div class="tube-layer">
    <div aria-hidden="true" class="tube-glass"></div>
    <div class="tube-wordmark">
      <Wordmark
        readout={observatory.vfd_readout}
        refresh_readouts={observatory.vfd_refresh_readouts}
        title={observatory.vfd_title}
      />
    </div>
  </div>
  <nav aria-label={observatory.social_label} class="social-links">
    {#each observatory.social_links as link}
      <a
        href={link.href}
        rel={link.external ? 'me noopener noreferrer' : undefined}
        target={link.external ? '_blank' : undefined}
        aria-label={link.aria_label}
      >
        <span class={link.icon} aria-hidden="true"></span>
        <span>{link.label}</span>
        <span class="i-ri-arrow-up-right-line" aria-hidden="true"></span>
      </a>
    {/each}
  </nav>
  <StageIntro
    {description}
    entry_label={observatory.entry_label}
    invert_description_in_light
  />
</div>

<style>
  .intro-cluster {
    --stage-intro-description-measure: 34rem;
    --stage-intro-entry-gap: 0.75rem;
    --vfd-inline-offset: clamp(-1.25rem, -1.5vw, -0.75rem);

    position: absolute;
    bottom: var(--viewport-bottom-inset);
    left: var(--stage-intro-inline-inset);
    z-index: 5;
    display: grid;
    width: min(42rem, calc(100% - 2 * var(--stage-intro-inline-inset)));
    gap: clamp(0.5rem, 1vw, 0.75rem);
  }

  .cabin-plate {
    display: flex;
    width: min(24vw, 13rem);
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-stage-ink-secondary);
    opacity: 0.72;
    user-select: none;
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

  .tube-layer {
    position: relative;
    width: min(39vw, 29rem);
    aspect-ratio: 68.4 / 22.2;
    margin-inline-start: var(--vfd-inline-offset, 0px);
    pointer-events: none;
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

  .social-links {
    display: flex;
    min-height: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
    user-select: none;
  }

  .social-links a {
    position: relative;
    display: inline-flex;
    min-height: 1.5rem;
    padding: 0.0625rem 0 0.4375rem;
    color: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 68%,
      transparent
    );
    font-size: 0.625rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1.15;
    text-decoration: none;
    align-items: center;
    gap: 0.4375rem;
    transition:
      color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .social-links a::after {
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

  .social-links a > :first-child {
    font-size: 0.8125rem;
  }

  .social-links a > :last-child {
    margin-left: 0.0625rem;
    font-size: 0.75rem;
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

  @media (width < 40rem) {
    .intro-cluster {
      --stage-intro-description-measure: 21rem;
      --stage-intro-entry-gap: 0.625rem;
      --vfd-inline-offset: -0.75rem;

      gap: 0.5rem;
    }

    .cabin-plate {
      width: min(72vw, 25rem);
    }
  }

  @media (width < 38rem) {
    .tube-layer {
      width: min(76vw, 26rem);
    }
  }

  @media (width < 40rem) and (prefers-reduced-motion: no-preference) {
    .intro-cluster {
      transition: bottom 320ms var(--ease-out);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .social-links a {
      transform: none;
      transition: none;
    }
  }
</style>
