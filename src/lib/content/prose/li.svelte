<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<li {...attributes}>{@render children?.()}</li>

<style>
  li {
    --prose-list-margin: var(--prose-nested-gap);

    margin-top: 0.35rem;
    padding-inline-start: 0.15rem;
    overflow-wrap: anywhere;
  }

  li:first-child {
    margin-top: 0;
  }

  li.task-list-item {
    display: grid;
    padding-inline-start: 0;
    grid-template-columns: 0.875rem minmax(0, 1fr);
    align-items: start;
    column-gap: 0.5rem;
    list-style: none;
  }

  li.task-list-item > :global(ul),
  li.task-list-item > :global(ol),
  li.task-list-item > :global(p) {
    grid-column: 2;
  }
</style>
