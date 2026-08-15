<script lang="ts">
  import type { StageProps } from '$lib/presentation/contract'
  import VfdTube from '$lib/presentation/parts/vfd-tube/view.svelte'
  import type { SkyMapSurfaceState } from '$lib/presentation/surfaces/sky-map/contract'
  import SkyMapSurface from '$lib/presentation/surfaces/sky-map/view.svelte'
  import StageIntro from '$lib/site/stage-intro.svelte'

  import { create_observatory_controller } from './controller.svelte'

  /* oxlint-disable prefer-const -- Stage callback can update with its host. */
  let { intro, on_signal }: StageProps = $props()
  const controller = create_observatory_controller(() => on_signal)
  const signal_color = $derived(
    controller.color_for(controller.state.pulse.signal_color_index),
  )
  const tube_readout = $derived(
    format_tube_readout(controller.state.view_status),
  )
  const surface_state = $derived<SkyMapSurfaceState>({
    signal_active: controller.state.pulse.active,
    signal_color,
    view_status: controller.state.view_status,
  })

  function format_tube_readout({
    declination,
    right_ascension,
  }: SkyMapSurfaceState['view_status']) {
    const right_ascension_degrees = Math.round(right_ascension)
      .toString()
      .padStart(3, '0')
    const declination_degrees = Math.round(declination)
    const declination_sign = declination_degrees < 0 ? '-' : '+'
    const declination_magnitude = Math.abs(declination_degrees)
      .toString()
      .padStart(2, '0')
    return `R${right_ascension_degrees}*D${declination_sign}${declination_magnitude}`
  }
</script>

<div class="observatory-stage">
  <SkyMapSurface
    on_event={controller.handle_runtime_event}
    state={surface_state}
  />
  <div class="intro-cluster">
    <div aria-hidden="true" class="cabin-plate">
      <span class="micro-label">Port / 01</span>
    </div>
    <VfdTube
      active={surface_state.signal_active}
      color={signal_color}
      readout={tube_readout}
    />
    <nav aria-label="Caelyreth links" class="social-links">
      <a
        href="https://github.com/caelyreth"
        rel="me noopener noreferrer"
        target="_blank"
      >
        <span class="i-ri-github-line" aria-hidden="true"></span>
        <span>GitHub</span>
        <span class="i-ri-arrow-up-right-line" aria-hidden="true"></span>
      </a>
      <span aria-hidden="true" class="social-preview">
        <span class="i-ri-sparkling-line"></span>
        <span>Bluesky</span>
      </span>
      <span aria-hidden="true" class="social-preview">
        <span class="i-ri-chat-3-line"></span>
        <span>Mastodon</span>
      </span>
    </nav>
    <StageIntro description={intro.description} />
  </div>
</div>

<style>
  .observatory-stage {
    --stage-label-safe-left: max(
      clamp(0.75rem, 4vw, var(--inline-gutter)),
      env(safe-area-inset-left)
    );
    --stage-label-safe-right: max(
      clamp(0.75rem, 4vw, var(--inline-gutter)),
      env(safe-area-inset-right)
    );
    --stage-porthole-center-x: 74%;
    --stage-porthole-center-y: 42%;
    --stage-porthole-radius: clamp(25rem, 35vw, 40rem);

    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .intro-cluster {
    --stage-intro-description-measure: 34rem;
    --stage-intro-entry-gap: 0.75rem;
    --vfd-inline-offset: clamp(-1.25rem, -1.5vw, -0.75rem);

    position: absolute;
    bottom: var(--stage-intro-bottom-inset);
    left: var(--stage-intro-inline-inset);
    z-index: 5;
    display: grid;
    width: min(42rem, calc(100% - 2 * var(--stage-intro-inline-inset)));
    gap: clamp(0.5rem, 1vw, 0.75rem);
  }

  .cabin-plate {
    display: flex;
    width: min(37vw, 28rem);
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-stage-ink-secondary);
    opacity: 0.72;
  }

  .cabin-plate::before {
    width: 1px;
    height: 0.7rem;
    flex: none;
    content: '';
    background: var(--color-boundary);
  }

  .cabin-plate::after {
    height: 1px;
    flex: 1;
    content: '';
    background: var(--color-boundary);
  }

  .cabin-plate .micro-label {
    letter-spacing: 0.12em;
  }

  .social-links {
    display: flex;
    min-height: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
  }

  .social-links a,
  .social-preview {
    position: relative;
    display: inline-flex;
    min-height: 1.5rem;
    padding: 0.0625rem 0 0.4375rem;
    color: var(--color-stage-ink-secondary);
    font-size: 0.625rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1.15;
    align-items: center;
    gap: 0.4375rem;
  }

  .social-links a {
    text-decoration: none;
    transition:
      color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .social-links a::after,
  .social-preview::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      currentcolor 0 calc(100% - 0.75rem),
      transparent calc(100% - 0.75rem) calc(100% - 0.5rem),
      currentcolor calc(100% - 0.5rem)
    );
    content: '';
  }

  .social-links a > :first-child,
  .social-preview > :first-child {
    font-size: 0.8125rem;
  }

  .social-links a > :last-child {
    margin-left: 0.0625rem;
    font-size: 0.75rem;
  }

  .social-preview {
    color: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 68%,
      transparent
    );
    pointer-events: none;
  }

  .social-links a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  @media (hover: hover) {
    .social-links a:hover {
      color: var(--color-stage-ink);
      transform: translateY(-1px);
    }
  }

  @media (max-width: 40rem) {
    .observatory-stage {
      --stage-porthole-center-x: calc(100% + 30vw);
      --stage-porthole-center-y: 38%;
      --stage-porthole-radius: 75vw;
    }

    .intro-cluster {
      --stage-intro-description-measure: 21rem;
      --stage-intro-entry-gap: 0.625rem;
      --vfd-inline-offset: -0.75rem;

      gap: 0.5rem;
    }

    .cabin-plate {
      width: min(72vw, 25rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .social-links a {
      transform: none;
      transition: none;
    }
  }
</style>
