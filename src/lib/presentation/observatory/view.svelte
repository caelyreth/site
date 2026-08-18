<script lang="ts">
  import type { HomeFrontmatter } from '$lib/content/schema'

  import Intro from './intro.svelte'
  import PlanaSurface from './plana-surface.svelte'
  import SiteMark from './site-mark.svelte'
  import SkyField from './sky/view.svelte'

  interface Props {
    defer_surface?: boolean
    description?: string
    observatory: HomeFrontmatter['observatory']
    sky_paused?: boolean
  }

  let {
    defer_surface = false,
    description,
    observatory,
    sky_paused = false,
  }: Props = $props()
</script>

<div class="observatory">
  <SkyField
    deferred={defer_surface}
    paused={sky_paused}
    descent_label={observatory.descent_label}
    surface_label={observatory.surface_label}
  />
  <SiteMark />
  <Intro {description} {observatory} />
  <PlanaSurface />
</div>

<style>
  .observatory {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
</style>
