<script lang="ts">
  import { format_template, get_site_config } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  interface Props {
    page: number
    page_count: number
    path: string
  }

  let { page, page_count, path }: Props = $props()
  const site = get_site_config()

  function page_href(next_page: number) {
    const suffix = next_page === 1 ? '' : `/page/${next_page}`
    return site_href(`${path}${suffix}`)
  }
</script>

{#if page_count > 1}
  <nav
    class="pagination"
    aria-label={site.current.pagination.navigation_label}
  >
    {#if page > 1}
      <a
        aria-label={format_template(
          site.current.pagination.previous_aria_label,
          {
            page,
            page_count,
          },
        )}
        href={page_href(page - 1)}
        rel="prev">{site.current.pagination.previous_label}</a
      >
    {/if}

    <p>{page} / {page_count}</p>

    {#if page < page_count}
      <a
        aria-label={format_template(
          site.current.pagination.next_aria_label,
          {
            page,
            page_count,
          },
        )}
        href={page_href(page + 1)}
        rel="next">{site.current.pagination.next_label}</a
      >
    {/if}
  </nav>
{/if}

<style>
  .pagination {
    display: flex;
    width: max-content;
    max-width: 100%;
    margin-top: clamp(2rem, 5vw, 3.5rem);
    padding-top: 1rem;
    border-top: 1px solid var(--color-boundary);
    align-items: center;
    gap: 1rem;
    color: var(--color-muted);
  }

  a {
    display: inline-flex;
    min-height: 2.5rem;
    align-items: center;
    text-decoration: none;
    transition:
      color var(--dur-micro) var(--ease-out),
      text-decoration-color var(--dur-micro) var(--ease-out);
    text-decoration-color: var(--color-boundary);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.3em;
  }

  p {
    min-width: 2.75rem;
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.6875rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;
  }

  a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
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
