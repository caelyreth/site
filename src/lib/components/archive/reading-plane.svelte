<script lang="ts">
  import type { Snippet } from 'svelte'

  export type ReadingPlaneKind = 'constellations' | 'record' | 'records'

  interface Props {
    children: Snippet
    kind: ReadingPlaneKind
  }

  let { children, kind }: Props = $props()
</script>

<section
  class:constellations={kind === 'constellations'}
  class:record={kind === 'record'}
  class:records={kind === 'records'}
  class="reading-plane"
>
  <div class="reading-plane-inner">
    {@render children()}
  </div>
</section>

<style>
  /* Hallmark · pre-emit critique: P5 H4 E4 S5 R5 V4
   * macrostructure: Index-First / Map-Diagram · tone: austere archival
   * theme: established paper / cool accent · contrast: pass (40-41) · responsive: pass
   */
  .reading-plane {
    --archive-axis: clamp(1rem, 4vw, 3.5rem);
    --archive-content-inset: calc(
      var(--archive-axis) + clamp(1rem, 2vw, 1.5rem)
    );
    --plane-measure: 54rem;
    box-sizing: border-box;
    display: flex;
    width: min(100%, var(--frame-measure));
    min-block-size: max(100svh - var(--header-block-size), 34rem);
    margin-inline: auto;
    padding: clamp(2.75rem, 7vw, 5.5rem) var(--inline-gutter)
      clamp(3.5rem, 8vw, 6.5rem);
  }

  .reading-plane.record {
    --plane-measure: 45rem;
  }

  .reading-plane.constellations {
    --plane-measure: 58rem;
  }

  .reading-plane-inner {
    width: min(100%, var(--plane-measure));
    min-width: 0;
    margin-inline: auto;
  }

  @media (width < 40rem) {
    .reading-plane {
      min-block-size: 100dvh;
      padding-top: clamp(4.75rem, 16svh, 7rem);
    }
  }
</style>
