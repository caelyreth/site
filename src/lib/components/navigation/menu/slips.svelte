<script lang="ts">
  import { menu_items } from './content'

  interface Props {
    is_closing: boolean
    is_open: boolean
    on_select: () => void
  }

  const { is_closing, is_open, on_select }: Props = $props()
</script>

<nav
  class:is-closing={is_closing}
  class:is-open={is_open}
  class="primary"
  aria-label="Station menu options"
>
  {#each menu_items as item}
    <!-- svelte-ignore a11y_autofocus: The first choice receives focus only when the dialog opens. -->
    <button
      type="button"
      class="slip"
      class:directory={item.id === 'directory'}
      class:observation={item.id === 'observation'}
      class:transmission={item.id === 'transmission'}
      autofocus={item === menu_items[0]}
      onpointerdown={on_select}
      onclick={on_select}
      style:--slip-bottom={item.layout.bottom}
      style:--slip-enter-delay={item.layout.enter_delay}
      style:--slip-enter-x={item.layout.enter_x}
      style:--slip-enter-y={item.layout.enter_y}
      style:--slip-left={item.layout.left}
      style:--slip-right={item.layout.right}
      style:--slip-rotation={item.layout.rotation}
      style:--slip-top={item.layout.top}
    >
      <span class="micro-label slip-code">{item.code}</span>
      <span class="slip-title font-serif">{item.title}</span>
      <span class="micro-label slip-detail">{item.detail}</span>
    </button>
  {/each}
</nav>

<style>
  .primary {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }

  .slip {
    position: absolute;
    top: var(--slip-top);
    right: var(--slip-right);
    bottom: var(--slip-bottom);
    left: var(--slip-left);
    display: flex;
    width: max-content;
    max-width: calc(
      100vw - var(--menu-inset-left) - var(--menu-inset-right)
    );
    min-width: 0;
    padding: 0.9rem 1rem 1rem;
    cursor: pointer;
    border: 1px solid transparent;
    color: var(--slip-ink);
    background-color: var(--slip-surface);
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: auto;
    transform: rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    transition:
      color var(--dur-micro) var(--ease-out),
      transform var(--dur-micro) var(--ease-out);
    white-space: nowrap;
  }

  .slip-code {
    letter-spacing: 0.11em;
    opacity: 0.7;
  }

  .slip-title {
    min-width: 0;
    font-size: clamp(1.45rem, 3vw, 2.5rem);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 0.9;
  }

  .slip-detail {
    line-height: 1.3;
    opacity: 0.65;
  }

  @media (hover: hover) {
    .slip:hover {
      color: var(--menu-highlight);
      transform: translateY(-2px)
        rotate(
          calc(var(--slip-effective-rotation, var(--slip-rotation)) + 1deg)
        );
    }
  }

  .slip:active {
    transform: translateY(1px)
      rotate(var(--slip-effective-rotation, var(--slip-rotation)));
  }

  @keyframes slip-enter {
    from {
      opacity: 0;
      transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
  }

  @keyframes slip-leave {
    to {
      opacity: 0;
      transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
  }

  .primary.is-open:not(.is-closing) .slip {
    animation: slip-enter var(--dur-long) var(--ease-out)
      var(--slip-enter-delay) backwards;
  }

  .primary.is-closing .slip {
    animation: slip-leave var(--dur-long) var(--ease-out) both;
  }

  @media (max-width: 40rem) {
    .primary {
      display: grid;
      box-sizing: border-box;
      gap: 0.75rem;
      padding: max(18%, 5.5rem) var(--menu-inset-right) 0
        var(--menu-inset-left);
      align-content: start;
    }

    .slip {
      --slip-effective-rotation: 0deg;

      position: relative;
      top: auto;
      right: auto;
      bottom: auto;
      left: auto;
      width: auto;
      max-width: none;
      min-height: 4.875rem;
      padding: 0.75rem 0.875rem 0.875rem;
      gap: 0.3rem;
    }

    @keyframes mobile-slip-enter {
      from {
        opacity: 0;
        transform: translate3d(0, 1.25rem, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes mobile-slip-leave {
      to {
        opacity: 0;
        transform: translate3d(0, 1.25rem, 0);
      }
    }

    .primary.is-open:not(.is-closing) .slip {
      animation-name: mobile-slip-enter;
    }

    .primary.is-closing .slip {
      animation-name: mobile-slip-leave;
    }

    .slip-title {
      font-size: clamp(1.5rem, 7.5vw, 2.125rem);
    }
  }

  @media (max-height: 42rem) and (max-width: 40rem) {
    .primary {
      gap: 0.5rem;
      padding-top: max(15%, 4rem);
    }

    .slip {
      min-height: 0;
      padding-block: 0.55rem 0.625rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .primary.is-open .slip {
      animation: none;
    }
  }
</style>
