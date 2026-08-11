<script lang="ts">
  import type { Snippet } from 'svelte'

  import Surface from './surface.svelte'

  type Props = { children?: Snippet } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<Surface {...attributes} label="Warning" tone="warning"
  >{@render children?.()}</Surface
>
