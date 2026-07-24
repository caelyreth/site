<script lang="ts">
  const {
    side,
    inScene = false,
  }: {
    side: 'left' | 'right'
    inScene?: boolean
  } = $props()
</script>

<div
  aria-hidden="true"
  class="boundary-guide"
  class:station-boundary={!inScene}
  class:scene-boundary={inScene}
  class:boundary-left={side === 'left'}
  class:boundary-right={side === 'right'}
></div>

<style>
.boundary-guide {
  top: 0;
  bottom: 0;
  width: 14px;
  pointer-events: none;
  background-image:
    linear-gradient(var(--color-rule), var(--color-rule)),
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
  background-size:
    1px 100%,
    13px 100%,
    8px 100%;
  background-repeat: no-repeat;
}
.station-boundary {
  position: fixed;
  z-index: 20;
  opacity: var(--p, 0);
}
.station-boundary.boundary-left {
  left: calc(
    50% - var(--station-half-measure) - var(--station-guide-outset) +
      var(--station-boundary-inset)
  );
  background-position:
    right top,
    right top,
    right top;
}
.station-boundary.boundary-right {
  right: calc(
    50% - var(--station-half-measure) - var(--station-guide-outset)
  );
  background-position:
    left top,
    left top,
    left top;
}
.scene-boundary {
  position: absolute;
  z-index: 8;
  opacity: var(--p, 0);
}
.scene-boundary.boundary-left {
  left: calc(
    50% - var(--station-half-measure) - var(--station-guide-outset) +
      var(--station-boundary-inset)
  );
  background-position:
    right top,
    right top,
    right top;
}
.scene-boundary.boundary-right {
  right: calc(
    50% - var(--station-half-measure) - var(--station-guide-outset)
  );
  background-position:
    left top,
    left top,
    left top;
}
</style>
