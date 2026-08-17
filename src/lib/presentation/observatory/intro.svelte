<script lang="ts">
  import StageIntro from '$lib/components/layout/stage-intro.svelte'

  import VfdTube from './vfd-tube/view.svelte'

  interface Props {
    description?: string
  }

  let { description }: Props = $props()
</script>

<div class="intro-cluster">
  <div aria-hidden="true" class="cabin-plate">
    <span class="micro-label">Port / 01</span>
  </div>
  <VfdTube />
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
    <a
      href="https://x.com/caelyreth"
      rel="me noopener noreferrer"
      target="_blank"
    >
      <span class="i-ri-twitter-x-line" aria-hidden="true"></span>
      <span>X (Twitter)</span>
      <span class="i-ri-arrow-up-right-line" aria-hidden="true"></span>
    </a>
    <a href="mailto:me@iki.moe">
      <span class="i-ri-mail-line" aria-hidden="true"></span>
      <span>Email</span>
      <span class="i-ri-arrow-up-right-line" aria-hidden="true"></span>
    </a>
  </nav>
  <StageIntro {description} invert_description_in_light />
</div>

<style>
  .intro-cluster {
    --stage-intro-description-measure: 34rem;
    --stage-intro-entry-gap: 0.75rem;
    --vfd-inline-offset: clamp(-1.25rem, -1.5vw, -0.75rem);

    position: absolute;
    bottom: var(--viewport-bottom-inset);
    left: var(--stage-intro-inline-inset);
    z-index: 5;
    display: grid;
    width: min(42rem, calc(100% - 2 * var(--stage-intro-inline-inset)));
    gap: clamp(0.5rem, 1vw, 0.75rem);
  }

  .cabin-plate {
    display: flex;
    width: min(24vw, 13rem);
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-stage-ink-secondary);
    opacity: 0.72;
    user-select: none;
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
    user-select: none;
  }

  .social-links a {
    position: relative;
    display: inline-flex;
    min-height: 1.5rem;
    padding: 0.0625rem 0 0.4375rem;
    color: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 68%,
      transparent
    );
    font-size: 0.625rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1.15;
    text-decoration: none;
    align-items: center;
    gap: 0.4375rem;
    transition:
      color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .social-links a::after {
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

  .social-links a > :first-child {
    font-size: 0.8125rem;
  }

  .social-links a > :last-child {
    margin-left: 0.0625rem;
    font-size: 0.75rem;
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

  @media (width < 40rem) {
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

  @media (width < 40rem) and (prefers-reduced-motion: no-preference) {
    .intro-cluster {
      transition: bottom 320ms var(--ease-out);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .social-links a {
      transform: none;
      transition: none;
    }
  }
</style>
