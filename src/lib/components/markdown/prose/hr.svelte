<script lang="ts">
  import PaperSeam from '$lib/components/layout/paper-seam.svelte'

  interface Props extends Record<string, unknown> {
    class?: string
  }

  let { class: class_name, ...attributes }: Props = $props()
</script>

<div
  {...attributes}
  class={['divider', class_name].filter(Boolean).join(' ')}
  role="separator"
>
  <PaperSeam />
</div>

<style>
  .divider {
    width: calc(100% + var(--inline-gutter) * 2);
    margin: 3.5rem 0 0;
    margin-inline: calc(-1 * var(--inline-gutter));
  }
</style>
