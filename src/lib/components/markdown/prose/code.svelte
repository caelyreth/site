<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<code {...attributes}>{@render children?.()}</code>

<style>
  code {
    padding-block: 0.16em;
    padding-inline: 0.42em;
    border: 1px solid
      color-mix(in oklab, var(--color-alert-warning) 35%, transparent);
    color: var(--color-alert-warning);
    font-family:
      ui-monospace, 'SFMono-Regular', 'Cascadia Code', 'Roboto Mono',
      monospace;
    font-size: 0.8em;
    font-synthesis: none;
    font-variant-ligatures: none;
    line-height: 1;
    overflow-wrap: anywhere;
    tab-size: 2;
    vertical-align: 0.08em;
    background: color-mix(
      in oklab,
      var(--color-alert-warning) 12%,
      transparent
    );
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
</style>
