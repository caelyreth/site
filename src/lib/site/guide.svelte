<script lang="ts">
  interface Props {
    side: 'left' | 'right'
    inStage?: boolean
    reveal?: boolean
  }

  const {
    side,
    inStage: in_stage = false,
    reveal = false,
  }: Props = $props()
</script>

<div
  aria-hidden="true"
  class:site={!in_stage}
  class:stage={in_stage}
  class:reveal
  class:left={side === 'left'}
  class:right={side === 'right'}
  class="guide"
></div>

<style>
  .guide {
    top: 0;
    bottom: 0;
    width: 1px;
    pointer-events: none;
    background: var(--color-rule);
  }

  .guide::before {
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--guide-outset);
    pointer-events: none;
    content: '';
    background-image:
      repeating-linear-gradient(
        to bottom,
        var(--color-rule) 0 1px,
        transparent 1px 192px
      ),
      repeating-linear-gradient(
        to bottom,
        var(--color-rule) 0 1px,
        transparent 1px 48px
      );
    background-repeat: no-repeat;
    background-size:
      var(--guide-outset) 100%,
      8px 100%;
  }

  .site,
  .stage {
    position: fixed;
    z-index: 20;
  }

  .stage {
    position: absolute;
    z-index: 8;
  }

  .stage.reveal {
    opacity: var(--stage-progress);
  }

  .site {
    opacity: var(--stage-progress);
  }

  .left {
    left: calc(50% - var(--half-measure));
  }

  .right {
    right: calc(50% - var(--half-measure));
  }

  .left::before {
    right: 0;
    background-position:
      right top,
      right top;
  }

  .right::before {
    left: 0;
    background-position:
      left top,
      left top;
  }
</style>
