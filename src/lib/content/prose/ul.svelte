<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<ul {...attributes}>{@render children?.()}</ul>

<style>
  ul {
    margin: var(--prose-list-margin, var(--prose-block-gap)) 0 0;
    padding-inline-start: 1.5rem;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    list-style: square;
  }

  ul.contains-task-list {
    padding-inline-start: 0;
    list-style: none;
  }

  ul :global(ul) {
    list-style-type: disc;
  }

  ul :global(ul ul) {
    list-style-type: circle;
  }

  ul::marker {
    color: var(--color-muted);
    font-size: 0.8em;
  }
</style>
