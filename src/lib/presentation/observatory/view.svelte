<script lang="ts">
  import type { HomeFrontmatter } from '$lib/content/schema'
  import { site_href } from '$lib/navigation/path'

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
    about_href={site_href('/about')}
    about_label={observatory.about_label}
    deferred={defer_surface}
    paused={sky_paused}
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
