<script lang="ts">
  import { base } from '$app/paths'

  interface Props {
    page: number
    page_count: number
    path: string
  }

  let { page, page_count, path }: Props = $props()

  function page_href(next_page: number) {
    const suffix = next_page === 1 ? '' : `/page/${next_page}`
    return `${base}${path}${suffix}`.replace('//', '/')
  }
</script>

{#if page_count > 1}
  <nav class="pagination" aria-label="Pagination">
    {#if page > 1}
      <a href={page_href(page - 1)}>Previous</a>
    {/if}

    <p>{page} / {page_count}</p>

    {#if page < page_count}
      <a href={page_href(page + 1)}>Next</a>
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
