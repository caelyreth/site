<script lang="ts">
  import MenuOrnaments from './ornaments.svelte'
  import MenuSlips from './slips.svelte'
  import ThemeSlip from './theme-slip.svelte'

  interface Props {
    is_closing: boolean
    is_open: boolean
    on_close: () => void
  }

  const { is_closing, is_open, on_close }: Props = $props()
</script>

<div class="stage">
  <MenuOrnaments {is_closing} {is_open} />
  <MenuSlips {is_closing} {is_open} />
  <ThemeSlip {is_closing} {is_open} {on_close} />
  <p class="micro-label field-note">Caelyreth relay / viewing plane 01</p>
</div>

<style>
  .stage {
    --menu-gutter: clamp(0.75rem, 4vw, 2rem);
    --menu-inset-left: max(var(--menu-gutter), env(safe-area-inset-left));
    --menu-inset-right: max(var(--menu-gutter), env(safe-area-inset-right));
    --menu-inset-bottom: max(
      var(--menu-gutter),
      env(safe-area-inset-bottom)
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
    right: var(--menu-gutter);
    bottom: var(--menu-gutter);
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.3;
    pointer-events: none;
  }

  @media (max-width: 40rem) {
    .field-note {
      display: none;
    }
  }

  @supports (height: 100dvh) and (height: 100lvh) {
    .stage {
      --menu-inset-bottom: calc(
        max(var(--menu-gutter), env(safe-area-inset-bottom)) +
          max(0px, 100lvh - 100dvh)
      );
    }
  }
</style>
