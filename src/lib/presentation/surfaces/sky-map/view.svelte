<script lang="ts">
  import SkyCanvas from './parts/sky-canvas.svelte'
</script>

<div class="sky-map" data-sky-map>
  <div class="sky-field">
    <SkyCanvas />
  </div>
  <span class="label observatory-label">Observatory</span>
  <span aria-hidden="true" class="label descent-label"
    >Descent to station</span
  >
</div>

<style>
  .sky-map {
    --label-inline-inset: clamp(0.75rem, 4vw, var(--inline-gutter));
    --sky-map-field-start: 24%;
    --sky-map-fade-start: 0%;
    --sky-map-fade-end: 42%;
    --sky-field-opacity: max(0, calc(1 - var(--stage-progress) * 1.2));
    --label-safe-left: var(
      --stage-label-safe-left,
      max(var(--label-inline-inset), env(safe-area-inset-left))
    );
    --label-safe-right: var(
      --stage-label-safe-right,
      max(var(--label-inline-inset), env(safe-area-inset-right))
    );
    --label-block-inset: max(1.25rem, env(safe-area-inset-top));
    --label-bottom-inset: max(1.25rem, env(safe-area-inset-bottom));
    --label-rail-top: calc(
      var(--label-block-inset) +
        (
          var(--header-safe-inset) - var(--header-block-size) -
            var(--label-block-inset)
        ) *
        var(--stage-progress)
    );
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
  }

  .sky-field {
    position: absolute;
    inset: 0;
    opacity: var(--sky-field-opacity);
    will-change: opacity;
  }

  @supports (height: 100dvh) and (height: 100lvh) {
    .sky-map {
      --label-bottom-inset: calc(
        max(1.25rem, env(safe-area-inset-bottom)) +
          max(0px, 100lvh - 100dvh)
      );
    }
  }

  .label {
    box-sizing: border-box;
    margin: 0;
    color: var(--color-stage-ink-secondary);
    font-size: clamp(0.5rem, 0.42rem + 0.4vw, 0.625rem);
    font-weight: 500;
    letter-spacing: clamp(0.06em, 0.025em + 0.35vw, 0.12em);
    line-height: 1.2;
    min-width: 0;
    text-transform: uppercase;
  }

  .observatory-label {
    position: absolute;
    top: var(--label-rail-top);
    left: var(--label-safe-left);
    z-index: 4;
    white-space: nowrap;
  }

  .descent-label {
    position: absolute;
    right: var(--label-safe-right);
    bottom: var(--label-bottom-inset);
    z-index: 4;
    text-align: right;
    white-space: nowrap;
    opacity: var(--sky-field-opacity);
  }

  @media (max-width: 40rem) {
    .sky-map {
      --sky-map-field-start: 0%;
      --sky-map-fade-start: 12%;
      --sky-map-fade-end: 62%;
    }
  }
</style>
