<script lang="ts">
  import type {
    FooterProps,
    RegionOptions,
  } from '$lib/presentation/contract'
  import type { Component } from 'svelte'

  type Props = {
    footer: Component<FooterProps>
    options: RegionOptions
  }

  /* oxlint-disable prefer-const -- Footer selection can update with the route. */
  let { footer, options }: Props = $props()
  const Footer = $derived(footer)
  let footer_visible = $state(false)

  function observe_footer(node: HTMLElement) {
    if (typeof IntersectionObserver === 'undefined') {
      footer_visible = true
      return () => {
        footer_visible = false
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => (footer_visible = entry?.isIntersecting ?? false),
      { rootMargin: '200px 0px' },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      footer_visible = false
    }
  }
</script>

<footer class="station-footer" {@attach observe_footer}>
  <Footer visible={footer_visible} {options} />
</footer>

<style>
  .station-footer {
    position: relative;
    border-top: 1px solid var(--color-rule);
  }
</style>
