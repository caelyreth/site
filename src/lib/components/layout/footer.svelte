<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet<[boolean]>
  }

  /* oxlint-disable prefer-const -- Snippet props can update with the route. */
  let { children }: Props = $props()
  let visible = $state(false)

  function observe_footer(node: HTMLElement) {
    const observer = new IntersectionObserver(
      ([entry]) => (visible = entry?.isIntersecting ?? false),
      { rootMargin: '200px 0px' },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      visible = false
    }
  }
</script>

<footer class="site-footer" {@attach observe_footer}>
  {@render children?.(visible)}
</footer>

<style>
  .site-footer {
    position: relative;
    margin-top: var(--paper-seam-gap);
  }
</style>
