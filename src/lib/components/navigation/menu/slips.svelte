<script lang="ts">
  import { menu_previews } from './content'

  interface Props {
    is_closing: boolean
    is_open: boolean
  }

  const { is_closing, is_open }: Props = $props()
</script>

<div
  aria-hidden="true"
  class:is-closing={is_closing}
  class:is-open={is_open}
  class="collection-previews"
>
  {#each menu_previews as item}
    <span
      class="slip"
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
    </span>
  {/each}
</div>

<style>
  .collection-previews {
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
    min-width: min(
      11rem,
      calc(100vw - var(--menu-inset-left) - var(--menu-inset-right))
    );
    padding: 0.9rem 1rem 1rem;
    border: 1px solid transparent;
    color: var(--slip-ink);
    background-color: var(--slip-surface);
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
    transform: rotate(var(--slip-effective-rotation, var(--slip-rotation)));
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

  .collection-previews.is-open:not(.is-closing) .slip {
    animation: slip-enter var(--dur-long) var(--ease-out)
      var(--slip-enter-delay) backwards;
  }

  .collection-previews.is-closing .slip {
    animation: slip-leave var(--dur-long) var(--ease-out) both;
  }

  @media (max-width: 40rem) {
    .collection-previews {
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

    .collection-previews.is-open:not(.is-closing) .slip {
      animation-name: mobile-slip-enter;
    }

    .collection-previews.is-closing .slip {
      animation-name: mobile-slip-leave;
    }

    .slip-title {
      font-size: clamp(1.5rem, 7.5vw, 2.125rem);
    }
  }

  @media (max-height: 42rem) and (max-width: 40rem) {
    .collection-previews {
      gap: 0.5rem;
      padding-top: max(15%, 4rem);
    }

    .slip {
      min-height: 0;
      padding-block: 0.55rem 0.625rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .collection-previews.is-open .slip {
      animation: none;
    }
  }
</style>
