<script lang="ts">
  import type { Snippet } from 'svelte'

  import Heading from './heading.svelte'
  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    children,
    ...attributes
  }: { children?: Snippet } & Record<string, unknown> = $props()
</script>

<Heading depth={2} {...attributes}>{@render children?.()}</Heading>
