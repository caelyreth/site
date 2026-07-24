<script lang="ts">
  import 'virtual:uno.css'
  import '../app.css'
  import StationChrome from '$lib/station-chrome.svelte'
  import StationFooter from '$lib/station-footer.svelte'
  import StationHeader from '$lib/station-header.svelte'

  const { children } = $props()

  // 0 keeps the opening full width; 1 docks it to the station deck.
  const CAPTURE_SCROLL_RATIO = 1
  let p = $state<number | undefined>(undefined)

  $effect(() => {
    let frame: number | undefined

    const updateProgress = () => {
      frame = undefined
      const next = Math.min(
        1,
        Math.max(
          0,
          window.scrollY / (window.innerHeight * CAPTURE_SCROLL_RATIO),
        ),
      )
      if (next !== p) p = next
    }

    const onScroll = () => {
      if (frame !== undefined) return
      frame = requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== undefined) cancelAnimationFrame(frame)
    }
  })
</script>

<div
  relative
  z-10
  min-h-screen
  flex="~ col"
  style:--capture-progress={CAPTURE_SCROLL_RATIO}
  style:--p={p}
>
  <StationChrome />
  <StationHeader />

  <main flex="~ col 1">
    <div mx-auto w-full px-6 class="deck" flex="~ col 1">
      {@render children()}
    </div>
  </main>

  <StationFooter />
</div>
