<script lang="ts">
  import { get_library_config } from '$lib/content/library'
  import type { ConstellationReference } from '$lib/content/relations'
  import { site_href } from '$lib/navigation/path'

  interface Props {
    constellations: ConstellationReference[]
  }

  let { constellations }: Props = $props()
  const library = get_library_config()
</script>

{#if constellations.length}
  <nav
    class="constellation-links"
    aria-label={library.current.constellations.related_navigation_label}
  >
    <span class="constellation-kind"
      >{library.current.constellations.related_label}</span
    >
    {#each constellations as constellation}
      <a href={site_href(`/constellations/${constellation.id}`)}>
        <span class="constellation-title">{constellation.title}</span>
      </a>
    {/each}
  </nav>
{/if}

<style>
  .constellation-links {
    display: flex;
    min-width: 0;
    margin: 0.5rem 0 0.95rem;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.3rem 0.55rem;
  }

  .constellation-kind {
    flex: 0 0 auto;
    color: var(--color-muted);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    line-height: 1.35;
  }

  a {
    display: flex;
    min-width: 0;
    align-items: baseline;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.35;
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .constellation-title {
    min-width: 0;
    letter-spacing: 0.06em;
    text-decoration-color: var(--color-boundary);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.28em;
    text-decoration-line: underline;
    white-space: nowrap;
  }

  a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.2rem;
  }

  @media (hover: hover) {
    a:hover {
      color: var(--color-text-link);
      text-decoration-color: currentcolor;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
</style>
