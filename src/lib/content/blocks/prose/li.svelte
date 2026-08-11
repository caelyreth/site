<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<li {...attributes}>{@render children?.()}</li>

<style>
  li {
    --prose-list-gap: 0.25rem;

    margin-top: 0.25rem;
    padding-inline-start: 0.15rem;
    overflow-wrap: anywhere;
  }

  li.task-list-item {
    padding-inline-start: 0;
    list-style: none;
  }
</style>
