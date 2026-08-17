<script lang="ts">
  interface Props {
    href: string
    label: string
  }

  let { href, label }: Props = $props()
</script>

<a class="archive-back-link" {href}>
  <span class="i-ri-arrow-left-line" aria-hidden="true"></span>
  <span>{label}</span>
</a>

<style>
  .archive-back-link {
    display: inline-flex;
    min-height: 2.75rem;
    color: var(--color-muted);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    line-height: 1.3;
    text-decoration: none;
    text-transform: uppercase;
    align-items: center;
    gap: 0.5rem;
    transition: color var(--dur-short) var(--ease-out);
  }

  .archive-back-link span:first-child {
    width: 1rem;
    height: 1rem;
    transition: transform var(--dur-short) var(--ease-out);
  }

  .archive-back-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  @media (hover: hover) {
    .archive-back-link:hover {
      color: var(--color-text-link);
    }

    .archive-back-link:hover span:first-child {
      transform: translateX(-0.2rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .archive-back-link,
    .archive-back-link span:first-child {
      transition: none;
    }
  }
</style>
