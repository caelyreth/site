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
    padding: 0;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    list-style: none;
  }

  ul.contains-task-list {
    --prose-list-gap: 0.625rem;
  }

  ul > :global(li) {
    position: relative;
    padding-inline-start: 1.25rem;
  }

  ul > :global(li)::before {
    position: absolute;
    top: 0.8em;
    left: 0;
    width: 0.625rem;
    height: 1px;
    background: var(--color-boundary);
    content: '';
  }

  ul > :global(li) + :global(li) {
    margin-top: var(--prose-list-gap, 0.5rem);
  }

  ul :global(ul) > :global(li)::before {
    width: 0.375rem;
    height: 0.375rem;
    border: 1px solid var(--color-boundary);
    background: transparent;
    transform: translateY(-0.125rem) rotate(45deg);
  }
</style>
