<script lang="ts">
  interface Props extends Record<string, unknown> {
    'aria-label'?: string
    'checked'?: boolean
    'disabled'?: boolean
    'type'?: string
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    'aria-label': aria_label,
    checked = false,
    disabled = false,
    type,
    ...attributes
  }: Props = $props()
</script>

{#if type === 'checkbox'}
  <span class="task-checkbox" data-checked={checked}>
    <input
      {...attributes}
      aria-label={aria_label ?? (checked ? 'Completed' : 'Not completed')}
      {checked}
      {disabled}
      {type}
    />
  </span>
{:else}
  <input {...attributes} {checked} {disabled} {type} />
{/if}

<style>
  .task-checkbox {
    position: relative;
    display: block;
    inline-size: 0.875rem;
    block-size: 0.875rem;
    margin-block-start: 0.25em;
  }

  .task-checkbox::before,
  .task-checkbox::after {
    position: absolute;
    pointer-events: none;
    content: '';
  }

  .task-checkbox::before {
    inset: 0;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  .task-checkbox[data-checked='true']::before {
    border-color: var(--color-accent);
    background: var(--color-accent);
  }

  .task-checkbox[data-checked='true']::after {
    inset: 0.2rem 0.16rem 0.28rem 0.18rem;
    border-bottom: 1px solid var(--color-paper);
    border-left: 1px solid var(--color-paper);
    transform: rotate(-45deg);
  }

  .task-checkbox :global(input) {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    margin: 0;
    opacity: 0;
  }

  @media (forced-colors: active) {
    .task-checkbox::before {
      border-color: CanvasText;
      background: Canvas;
    }

    .task-checkbox[data-checked='true']::before {
      border-color: Highlight;
      background: Highlight;
    }

    .task-checkbox[data-checked='true']::after {
      border-color: HighlightText;
    }
  }
</style>
