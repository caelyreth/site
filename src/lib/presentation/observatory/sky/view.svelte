<script lang="ts">
  import SkyCanvas from './canvas.svelte'
  import { SKY_FIELD_FADE_RATE } from './config'

  interface Props {
    about_href: string
    about_label: string
    deferred?: boolean
    paused?: boolean
    surface_label: string
  }

  let {
    about_href,
    about_label,
    deferred = false,
    paused = false,
    surface_label,
  }: Props = $props()
</script>

<div
  class="sky-surface"
  class:is-deferred={deferred}
  data-sky-field
  style:--sky-field-fade-rate={SKY_FIELD_FADE_RATE}
>
  <div aria-hidden="true" class="sky-field" data-nosnippet="">
    <SkyCanvas {deferred} {paused} />
  </div>
  <span aria-hidden="true" class="label observatory-label" data-nosnippet=""
    >{surface_label}</span
  >
  <a class="label descent-link" href={about_href}>
    <span>{about_label}</span>
    <span aria-hidden="true" class="i-ri-arrow-right-line descent-icon"
    ></span>
  </a>
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
    --label-bottom-inset: var(--stage-bottom-inset);
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

  .descent-link {
    position: absolute;
    right: var(--label-safe-right);
    bottom: var(--label-bottom-inset);
    z-index: 4;
    display: inline-flex;
    color: var(--color-stage-ink-secondary);
    align-items: center;
    gap: 0.45rem;
    text-align: right;
    text-decoration: none;
    white-space: nowrap;
    opacity: var(--sky-field-opacity);
    transition: color var(--dur-short) var(--ease-out);
  }

  .descent-icon {
    width: 0.9rem;
    height: 0.9rem;
  }

  .descent-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  @media (hover: hover) {
    .descent-link:hover {
      color: var(--color-stage-ink);
    }
  }

  @media (width < 40rem) {
    .sky-surface {
      --sky-field-start: -8%;
      --sky-field-fade-start: 0%;
      --sky-field-fade-end: 28%;
    }

    .descent-link {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .descent-link {
      transition: none;
    }
  }
</style>
