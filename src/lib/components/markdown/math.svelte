<script module lang="ts">
  let stylesheet: Promise<void> | undefined

  function load_stylesheet() {
    stylesheet ??= import('katex/dist/katex.min.css?url')
      .then(({ default: href }) => {
        if (document.querySelector('link[data-katex-stylesheet]')) return

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.dataset.katexStylesheet = ''
        link.href = href
        document.head.append(link)
      })
      .catch((error: unknown) => {
        stylesheet = undefined
        throw error
      })
  }
</script>

<script lang="ts">
  import { Math } from '@comark/svelte/plugins/math'
  import { onMount } from 'svelte'

  interface Props {
    class?: string
    content: string
  }

  let { class: class_name = '', content }: Props = $props()

  onMount(load_stylesheet)
</script>

<Math {content} class={class_name} />
