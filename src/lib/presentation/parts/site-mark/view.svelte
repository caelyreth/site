<div aria-hidden="true" class="site-mark"></div>

<style>
  .site-mark {
    position: absolute;
    top: max(1.25rem, env(safe-area-inset-top));
    right: var(
      --stage-label-safe-right,
      max(
        clamp(0.75rem, 4vw, var(--inline-gutter)),
        env(safe-area-inset-right)
      )
    );
    z-index: 5;
    width: clamp(1.25rem, 1.65vw, 1.5rem);
    aspect-ratio: 1;
    opacity: 0.78;
    pointer-events: none;
    background-color: var(--color-stage-ink-secondary);
    -webkit-mask: url('/favicon.svg') center / contain no-repeat;
    mask: url('/favicon.svg') center / contain no-repeat;
  }
</style>
