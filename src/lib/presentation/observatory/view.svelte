<script lang="ts">
  import Intro from './intro.svelte'
  import PlanaFigure from './plana-figure.svelte'
  import SiteMark from './site-mark.svelte'
  import SkyField from './sky/view.svelte'

  interface Props {
    defer_surface?: boolean
    description?: string
  }

  /* oxlint-disable prefer-const -- Observatory props can update with the route. */
  let { defer_surface = false, description }: Props = $props()
</script>

<div class="observatory">
  <SkyField deferred={defer_surface} />
  <SiteMark />
  <PlanaFigure />
  <Intro {description} />
</div>

<style>
  .observatory {
    --stage-label-safe-left: max(
      clamp(0.75rem, 4vw, var(--inline-gutter)),
      env(safe-area-inset-left)
    );
    --stage-label-safe-right: max(
      clamp(0.75rem, 4vw, var(--inline-gutter)),
      env(safe-area-inset-right)
    );
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
</style>
