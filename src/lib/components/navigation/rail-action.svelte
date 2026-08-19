<script lang="ts">
  interface Props {
    controls?: string
    expanded?: boolean
    icon: string
    label: string
    on_activate: () => void
  }

  let { controls, expanded, icon, label, on_activate }: Props = $props()
</script>

<button
  type="button"
  aria-controls={controls}
  aria-expanded={expanded}
  aria-label={label}
  class="rail-action"
  title={label}
  onclick={on_activate}
>
  <span class={icon} aria-hidden="true"></span>
</button>

<style>
  .rail-action {
    box-sizing: border-box;
    display: grid;
    width: 100%;
    height: 100%;
    min-width: 0;
    padding: 0;
    cursor: pointer;
    border: 0;
    color: inherit;
    background-color: transparent;
    place-items: center;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  .rail-action span {
    width: 1rem;
    height: 1rem;
    opacity: 0.72;
    transition: opacity var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .rail-action:hover {
      color: var(--color-paper-prime);
      background-color: var(--color-text);
    }

    .rail-action:hover span {
      opacity: 1;
    }

    .rail-action:active {
      color: var(--color-paper-prime);
      background-color: var(--color-text);
    }
  }

  .rail-action:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (width < 40rem) {
    .rail-action {
      -webkit-tap-highlight-color: transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail-action,
    .rail-action span {
      transition-duration: 1ms;
    }
  }
</style>
