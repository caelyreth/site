<script lang="ts">
  import MenuOrnaments from './ornaments.svelte'
  import MenuSlips from './slips.svelte'
  import ThemeSlip from './theme-slip.svelte'

  interface Props {
    is_closing: boolean
    is_open: boolean
    on_close: () => void
    on_navigate: () => void
  }

  const { is_closing, is_open, on_close, on_navigate }: Props = $props()
</script>

<div class="stage">
  <MenuOrnaments {is_closing} {is_open} />
  <MenuSlips {is_closing} {is_open} {on_navigate} />
  <ThemeSlip {is_closing} {is_open} {on_close} />
  <p
    class:is-closing={is_closing}
    class:is-open={is_open}
    class="micro-label field-note"
  >
    Caelyreth 中继站 / 观测面 01
  </p>
</div>

<style>
  .stage {
    --menu-gutter: clamp(0.75rem, 4vw, 2rem);
    --menu-inset-left: max(var(--menu-gutter), env(safe-area-inset-left));
    --menu-inset-right: max(var(--menu-gutter), env(safe-area-inset-right));
    --menu-inset-bottom: calc(
      max(var(--menu-gutter), env(safe-area-inset-bottom)) +
        max(0px, 100lvh - 100dvh)
    );
    position: relative;
    z-index: 3;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  .field-note {
    position: absolute;
    z-index: 3;
    right: calc(
      var(--stage-label-safe-right) + var(--stage-frame-inset) +
        var(--stage-frame-border)
    );
    bottom: calc(
      var(--viewport-bottom-inset) + var(--stage-frame-inset) +
        var(--stage-frame-border)
    );
    margin: 0;
    color: var(--color-text-secondary);
    font-size: clamp(0.5rem, 0.42rem + 0.4vw, 0.625rem);
    font-weight: 500;
    letter-spacing: clamp(0.06em, 0.025em + 0.35vw, 0.12em);
    line-height: 1.2;
    pointer-events: none;
    text-align: right;
    white-space: nowrap;
  }

  @keyframes field-note-enter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes field-note-leave {
    to {
      opacity: 0;
    }
  }

  .field-note.is-open:not(.is-closing) {
    animation: field-note-enter var(--dur-long) var(--ease-out) 240ms
      backwards;
  }

  .field-note.is-closing {
    animation: field-note-leave var(--dur-long) var(--ease-out) both;
  }

  @media (width < 40rem) {
    .field-note {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .field-note.is-open,
    .field-note.is-closing {
      animation: none;
    }
  }
</style>
