<script lang="ts">
  import PaperSeam from '$lib/site/paper-seam.svelte'

  type Props = { class?: string } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
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
