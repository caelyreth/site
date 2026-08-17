<script lang="ts">
  import type { Snippet } from 'svelte'

  import Heading from './heading.svelte'
  let {
    children,
    ...attributes
  }: { children?: Snippet } & Record<string, unknown> = $props()
</script>

<Heading depth={1} {...attributes}>{@render children?.()}</Heading>
