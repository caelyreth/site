<script lang="ts">
  interface Props {
    description?: string
  }

  /* oxlint-disable prefer-const -- Intro props can update with the route. */
  let { description }: Props = $props()
</script>

<div class="stage-intro">
  {#if description}
    <p><span class="description">{description}</span></p>
  {/if}
  <a class="entry" href="#content">
    <span>Field notes below</span>
    <span class="i-ri-arrow-down-line entry-icon" aria-hidden="true"></span>
  </a>
</div>

<style>
  .stage-intro {
    color: var(--color-stage-ink);
  }

  p {
    margin: 0;
  }

  p {
    max-width: var(--stage-intro-description-measure, 30rem);
    color: var(--color-stage-ink-secondary);
    font-size: clamp(0.8125rem, 0.7rem + 0.35vw, 0.9375rem);
    line-height: 1.45;
  }

  .entry {
    display: inline-flex;
    width: max-content;
    margin-top: var(--stage-intro-entry-gap, 1.125rem);
    padding-top: 0.625rem;
    border-top: 1px solid var(--color-boundary);
    color: var(--color-stage-ink-secondary);
    font-size: clamp(0.6875rem, 0.6rem + 0.22vw, 0.75rem);
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.2;
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

  @media (prefers-reduced-motion: reduce) {
    .entry,
    .entry-icon {
      transition: none;
    }
  }
</style>
