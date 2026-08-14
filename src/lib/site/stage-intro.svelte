<script lang="ts">
  import type { StageIntroContent } from './stage-intro'

  /* oxlint-disable prefer-const -- Intro props can update with the route. */
  let { description, title }: StageIntroContent = $props()
</script>

<div class="stage-intro">
  <h1 id="stage-title" class="font-serif">{title}</h1>
  {#if description}<p>{description}</p>{/if}
  <a class="entry" href="#content">
    <span>Field notes below</span>
    <span class="i-ri-arrow-down-line entry-icon" aria-hidden="true"></span>
  </a>
</div>

<style>
  .stage-intro {
    position: absolute;
    right: var(--stage-intro-inline-inset);
    bottom: var(--stage-intro-bottom-inset);
    left: var(--stage-intro-inline-inset);
    z-index: 5;
    color: var(--color-stage-ink);
    opacity: calc(1 - var(--stage-progress));
    pointer-events: none;
    transform: translateY(calc(var(--stage-progress) * 0.75rem));
  }

  h1,
  p {
    margin: 0;
  }

  h1 {
    font-size: clamp(1.625rem, 1rem + 2vw, 2.75rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 0.95;
  }

  p {
    max-width: 30rem;
    margin-top: 0.625rem;
    color: var(--color-stage-ink-secondary);
    font-size: clamp(0.8125rem, 0.7rem + 0.35vw, 0.9375rem);
    line-height: 1.45;
  }

  .entry {
    display: inline-flex;
    width: max-content;
    margin-top: 1.125rem;
    padding-top: 0.625rem;
    border-top: 1px solid var(--color-boundary);
    color: var(--color-stage-ink-secondary);
    font-size: clamp(0.6875rem, 0.6rem + 0.22vw, 0.75rem);
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.2;
    pointer-events: auto;
    text-decoration: none;
    align-items: center;
    gap: 0.5rem;
  }

  .entry-icon {
    width: 1rem;
    height: 1rem;
    transition: transform var(--dur-short) var(--ease-out);
  }

  .entry:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  @media (hover: hover) {
    .entry:hover {
      color: var(--color-stage-ink);
    }
  }

  @media (max-width: 40rem) {
    h1 {
      font-size: clamp(1.5rem, 5vw, 2rem);
    }

    p {
      max-width: 21rem;
      margin-top: 0.5rem;
      font-size: 0.8125rem;
    }

    .entry {
      margin-top: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stage-intro,
    .entry,
    .entry-icon {
      transition: none;
    }
  }
</style>
