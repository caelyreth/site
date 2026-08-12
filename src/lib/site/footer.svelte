<script lang="ts">
  import type {
    FooterProps,
    RegionOptions,
  } from '$lib/presentation/contract'
  import type { Component } from 'svelte'

  type Props = {
    component: Component<FooterProps>
    options: RegionOptions
  }

  /* oxlint-disable prefer-const -- Footer selection can update with the route. */
  let { component, options }: Props = $props()
  const Footer = $derived(component)
  let visible = $state(false)

  function observe_footer(node: HTMLElement) {
    if (typeof IntersectionObserver === 'undefined') {
      visible = true
      return () => {
        visible = false
      }
    }

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
  <Footer {visible} {options} />
</footer>

<style>
  .site-footer {
    position: relative;
  }
</style>
