<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<sub {...attributes}>{@render children?.()}</sub>

<style>
  sub {
    /* Comark requires a boundary space before inline components; absorb it visually. */
    margin-inline-start: -0.3em;
    font-size: 0.75em;
    line-height: 0;
    vertical-align: sub;
  }
</style>
