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
    background: var(--color-stage-rule);
  }

  @supports (animation-timeline: scroll(root block)) {
    .site {
      animation: stage-progress 1ms linear both;
      animation-range: 0 var(--stable-viewport-block);
      animation-timeline: scroll(root block);
    }
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

  @media (max-width: 40rem) {
    .guide.stage {
      display: none;
    }
  }
</style>
