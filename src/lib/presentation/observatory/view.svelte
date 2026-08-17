<script lang="ts">
  import Intro from './intro.svelte'
  import PlanaSurface from './plana-surface.svelte'
  import SiteMark from './site-mark.svelte'
  import SkyField from './sky/view.svelte'

  interface Props {
    defer_surface?: boolean
    description?: string
    sky_paused?: boolean
  }

  let {
    defer_surface = false,
    description,
    sky_paused = false,
  }: Props = $props()
</script>

<div class="observatory">
  <SkyField deferred={defer_surface} paused={sky_paused} />
  <SiteMark />
  <Intro {description} />
  <PlanaSurface />
</div>

<style>
  .observatory {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
</style>
