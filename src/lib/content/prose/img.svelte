<script lang="ts">
  import { onMount } from 'svelte'

  interface Props extends Record<string, unknown> {
    alt?: string
    class?: string
    decoding?: 'async' | 'auto' | 'sync'
    height?: number | string
    loading?: 'eager' | 'lazy'
    src?: string
    title?: string
    width?: number | string
  }

  function positive_number(value: number | string | undefined) {
    const number = Number(value)
    return Number.isFinite(number) && number > 0 ? number : undefined
  }

  type MediaState = 'failed' | 'pending' | 'ready'

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    alt = '',
    class: class_name,
    decoding = 'async',
    height,
    loading = 'lazy',
    src,
    title,
    width,
    ...attributes
  }: Props = $props()

  let image: HTMLImageElement | undefined = $state()
  let media_state: MediaState = $state('pending')
  let current_src: string | undefined
  let source_initialized = false

  const aspect_ratio = $derived.by(() => {
    const image_width = positive_number(width)
    const image_height = positive_number(height)

    if (image_width && image_height) {
      return `${image_width} / ${image_height}`
    }

    return '3 / 2'
  })

  function image_loaded() {
    media_state = 'ready'
  }

  function image_failed() {
    media_state = 'failed'
  }

  $effect(() => {
    if (!source_initialized) {
      current_src = src
      source_initialized = true
      return
    }

    if (src === current_src) return
    current_src = src
    media_state = 'pending'
  })

  onMount(() => {
    if (!image || !image.complete) return
    media_state = image.naturalWidth > 0 ? 'ready' : 'failed'
  })
</script>

<figure class={class_name} data-state={media_state}>
  <div
    class="media-frame"
    data-content-media
    style:aspect-ratio={aspect_ratio}
  >
    <img
      {...attributes}
      {alt}
      {decoding}
      {height}
      {loading}
      {src}
      {width}
      bind:this={image}
      onerror={image_failed}
      onload={image_loaded}
    />
    <span aria-hidden="true" class="media-failure">Image unavailable</span>
  </div>
  {#if title}<figcaption>{title}</figcaption>{/if}
</figure>

<style>
  figure {
    max-inline-size: min(100%, 22rem);
    margin: var(--prose-block-gap) 0 0;
  }

  figure.wide {
    max-inline-size: 100%;
  }

  .media-frame {
    position: relative;
    inline-size: 100%;
    overflow: hidden;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  img {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
    object-position: center;
    opacity: 0;
    transition: opacity 260ms ease-out;
  }

  figure[data-state='ready'] img {
    opacity: 1;
  }

  figure[data-state='failed'] img {
    opacity: 0;
  }

  .media-failure {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.45;
    opacity: 0;
    pointer-events: none;
  }

  figure[data-state='failed'] .media-failure {
    opacity: 1;
  }

  figcaption {
    margin-top: 0.625rem;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.45;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }
</style>
