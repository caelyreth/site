<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<li {...attributes}>{@render children?.()}</li>

<style>
  li {
    --prose-list-margin: var(--prose-nested-gap);

    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  li.task-list-item::before {
    content: none;
  }

  li.task-list-item {
    display: grid;
    padding-inline-start: 0;
    grid-template-columns: 0.9375rem minmax(0, 1fr);
    align-items: start;
    column-gap: 0.625rem;
    list-style: none;
  }

  li.task-list-item > :global(ul),
  li.task-list-item > :global(ol),
  li.task-list-item > :global(p) {
    grid-column: 2;
  }

  li.task-list-item > :global(p) {
    margin-block-start: 0;
  }
</style>
