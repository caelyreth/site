<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<ul {...attributes}>{@render children?.()}</ul>

<style>
  ul {
    margin: 1rem 0 0;
    padding-inline-start: 1.25rem;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    list-style: square;
    margin-block-start: var(--prose-list-gap, 1rem);
  }

  ul.contains-task-list {
    padding-inline-start: 0;
    list-style: none;
  }
</style>
