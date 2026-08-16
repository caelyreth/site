<script lang="ts">
  import PaperEdge from './paper-edge.svelte'
</script>

<div aria-hidden="true" class="field-surface paper-seam">
  <div class="upper-edge">
    <div class="paper-surface upper-body"></div>
    <div class="upper-paper-edge">
      <PaperEdge guide side="bottom" />
    </div>
  </div>
  <div class="lower-edge">
    <PaperEdge side="top" />
  </div>
</div>

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
  }

  .upper-body {
    top: 0;
    height: calc(100% - var(--paper-edge-depth));
  }

  .upper-edge {
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: var(--paper-seam-upper-height);
  }

  .upper-paper-edge {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
  }

  .lower-edge {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
  }
</style>
