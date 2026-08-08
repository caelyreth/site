<script lang="ts">
  import FooterDeck from './footer-deck.svelte'

  let footer_visible = $state(false)

  // MARK: - footer visibility
  function observe_footer(node: HTMLElement) {
    if (typeof IntersectionObserver === 'undefined') {
      footer_visible = true
      return () => {
        footer_visible = false
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => (footer_visible = entry.isIntersecting),
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
  <FooterDeck is_footer_visible={footer_visible} />
</footer>

<style>
  .station-footer {
    position: relative;
    border-top: 1px solid var(--color-rule);
  }
</style>
