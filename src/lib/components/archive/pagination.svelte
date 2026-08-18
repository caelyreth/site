<script lang="ts">
  import { format_template, get_site_config } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  interface Props {
    page: number
    page_count: number
    path: string
    placement?: 'after' | 'before'
  }

  let { page, page_count, path, placement = 'after' }: Props = $props()
  const site = get_site_config()

  function page_href(next_page: number) {
    const suffix = next_page === 1 ? '' : `/page/${next_page}`
    return site_href(`${path}${suffix}`)
  }
</script>

{#if page_count > 1}
  <nav
    class:after={placement === 'after'}
    class:before={placement === 'before'}
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
        rel="prev"
      >
        <span aria-hidden="true" class="i-ri-arrow-left-s-line"></span>
        <span class="visually-hidden"
          >{site.current.pagination.previous_label}</span
        >
      </a>
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
        rel="next"
      >
        <span aria-hidden="true" class="i-ri-arrow-right-s-line"></span>
        <span class="visually-hidden"
          >{site.current.pagination.next_label}</span
        >
      </a>
    {/if}
  </nav>
{/if}

<style>
  .pagination {
    display: flex;
    width: fit-content;
    min-height: 2.25rem;
    margin-inline-start: var(--archive-content-inset);
    border: 1px solid var(--color-boundary);
    align-items: center;
    color: var(--color-muted);
  }

  .pagination.before {
    margin-block: clamp(1rem, 2vw, 1.5rem) clamp(0.5rem, 1vw, 0.75rem);
  }

  .pagination.after {
    margin-top: clamp(2.5rem, 6vw, 4rem);
  }

  a {
    display: inline-flex;
    width: 2.25rem;
    min-height: 2.25rem;
    align-items: center;
    justify-content: center;
    color: inherit;
    font-size: 0.8125rem;
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  p {
    min-width: 3.25rem;
    margin: 0;
    padding-inline: 0.625rem;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;
  }

  a + p,
  p + a {
    border-inline-start: 1px solid var(--color-boundary);
  }

  .i-ri-arrow-left-s-line,
  .i-ri-arrow-right-s-line {
    width: 1rem;
    height: 1rem;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (hover: hover) {
    a:hover {
      color: var(--color-text-link);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
</style>
