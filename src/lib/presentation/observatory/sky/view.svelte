<script lang="ts">
  import SkyCanvas from './canvas.svelte'
  import { SKY_FIELD_FADE_RATE } from './config'

  interface Props {
    deferred?: boolean
    paused?: boolean
    descent_label: string
    surface_label: string
  }

  let {
    deferred = false,
    paused = false,
    descent_label,
    surface_label,
  }: Props = $props()
</script>

<div
  aria-hidden="true"
  class="sky-surface"
  class:is-deferred={deferred}
  data-sky-field
  data-nosnippet=""
  style:--sky-field-fade-rate={SKY_FIELD_FADE_RATE}
>
  <div class="sky-field">
    <SkyCanvas {deferred} {paused} />
  </div>
  <span class="label observatory-label">{surface_label}</span>
  <span class="label descent-label">{descent_label}</span>
</div>

<style>
  .sky-surface {
    --sky-field-start: 24%;
    --sky-field-fade-start: 0%;
    --sky-field-fade-end: 42%;
    --sky-field-opacity: max(
      0,
      calc(1 - var(--stage-progress) * var(--sky-field-fade-rate))
    );
    --label-safe-left: var(--stage-label-safe-left);
    --label-safe-right: var(--stage-label-safe-right);
    --label-block-inset: max(1.25rem, env(safe-area-inset-top));
    --label-bottom-inset: var(--viewport-bottom-inset);
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
    -webkit-user-select: none;
    user-select: none;
  }

  .sky-field {
    position: absolute;
    top: calc(-1 * var(--stage-top));
    left: calc(-1 * var(--stage-inline-inset));
    width: 100vw;
    height: var(--stage-viewport);
    opacity: var(--sky-field-opacity);
    will-change: opacity;
  }

  .sky-surface.is-deferred .sky-field {
    opacity: 0;
    visibility: hidden;
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
    user-select: none;
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

  @media (width < 40rem) {
    .sky-surface {
      --sky-field-start: -8%;
      --sky-field-fade-start: 0%;
      --sky-field-fade-end: 28%;
    }

    .descent-label {
      display: none;
    }
  }
</style>
