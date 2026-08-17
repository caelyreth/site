<script lang="ts">
  import type { ContentFont } from '$lib/content/schema'
  import type { Snippet } from 'svelte'

  const alignments = ['start', 'center', 'end', 'justify'] as const

  type Alignment = (typeof alignments)[number]

  interface Props extends Record<string, unknown> {
    align?: string
    children?: Snippet
    class?: string
    font?: string
  }

  function is_content_font(
    value: string | undefined,
  ): value is ContentFont {
    return value === 'sans' || value === 'serif'
  }

  function is_alignment(value: string | undefined): value is Alignment {
    return (alignments as readonly string[]).includes(value ?? '')
  }

  let {
    align,
    children,
    class: class_name,
    font,
    ...attributes
  }: Props = $props()
  const block_font = $derived(is_content_font(font) ? font : undefined)
  const text_align = $derived(is_alignment(align) ? align : undefined)
</script>

<div
  {...attributes}
  class={['content-block', class_name].filter(Boolean).join(' ')}
  data-align={text_align}
  data-font={block_font}
>
  {@render children?.()}
</div>

<style>
  .content-block {
    margin-top: var(--prose-block-gap);
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    overflow-wrap: anywhere;
    text-wrap: pretty;
  }

  .content-block[data-font='sans'] {
    font-family: var(--font-stack-sans);
  }

  .content-block[data-font='serif'] {
    font-family: var(--font-stack-serif);
  }

  .content-block[data-align='start'] {
    text-align: start;
  }

  .content-block[data-align='center'] {
    text-align: center;
  }

  .content-block[data-align='end'] {
    text-align: end;
  }

  .content-block[data-align='justify'] {
    text-align: justify;
  }

  .content-block > :global(:first-child) {
    margin-top: 0;
  }
</style>
