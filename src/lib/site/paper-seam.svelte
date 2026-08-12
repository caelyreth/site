<script lang="ts">
  import PaperEdge from './paper-edge.svelte'

  type Props = {
    placement?: 'flow' | 'top' | 'bottom'
  }

  const { placement = 'flow' }: Props = $props()
</script>

{#if placement === 'flow'}
  <div aria-hidden="true" class="field-surface paper-seam">
    <div class="paper-surface upper-edge">
      <div class="seam-guide"></div>
      <PaperEdge side="bottom" />
    </div>
    <div class="paper-surface lower-edge">
      <PaperEdge side="top" />
    </div>
  </div>
{:else}
  <div
    aria-hidden="true"
    class:top={placement === 'top'}
    class:bottom={placement === 'bottom'}
    class="paper-seam edge-seam"
  >
    {#if placement === 'bottom'}<div class="seam-guide"></div>{/if}
    <PaperEdge side={placement} />
  </div>
{/if}

<style>
  .paper-seam {
    position: relative;
  }

  .field-surface {
    height: calc(
      var(--paper-seam-upper-height) + var(--paper-seam-gap) +
        var(--paper-edge-depth)
    );
    overflow: clip;
  }

  .paper-surface {
    position: absolute;
    inset-inline: 0;
    z-index: 1;
    height: var(--paper-edge-depth);
  }

  .upper-edge {
    top: 0;
    height: var(--paper-seam-upper-height);
    clip-path: var(--paper-edge-bottom-clip);
  }

  .lower-edge {
    bottom: 0;
    clip-path: var(--paper-edge-top-clip);
  }

  .edge-seam {
    position: absolute;
    z-index: 2;
    left: 0;
    width: 100%;
    height: var(--paper-edge-depth);
  }

  .edge-seam.bottom {
    height: var(--paper-seam-upper-height);
    bottom: 0;
  }

  .edge-seam.top {
    top: 0;
  }

  .seam-guide {
    position: absolute;
    right: var(--paper-seam-guide-inset);
    bottom: calc(var(--paper-edge-depth) + var(--paper-seam-guide-offset));
    left: var(--paper-seam-guide-inset);
    z-index: 1;
    height: 1px;
    pointer-events: none;
    background-image: repeating-linear-gradient(
      to right,
      var(--color-rule) 0 0.25rem,
      transparent 0.25rem 0.5rem
    );
  }
</style>
