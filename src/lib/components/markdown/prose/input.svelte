<script lang="ts">
  interface Props extends Record<string, unknown> {
    'aria-label'?: string
    'checked'?: boolean
    'disabled'?: boolean
    'type'?: string
  }

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
    <svg aria-hidden="true" class="task-check" viewBox="0 0 16 16">
      <path d="m3.25 8.25 3 3 6.5-6.5" />
    </svg>
  </span>
{:else}
  <input {...attributes} {checked} {disabled} {type} />
{/if}

<style>
  .task-checkbox {
    position: relative;
    display: block;
    inline-size: 0.9375rem;
    block-size: 0.9375rem;
    margin-block-start: 0.28em;
  }

  .task-checkbox::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid var(--color-boundary);
    background: color-mix(
      in oklab,
      var(--color-prose-surface) 82%,
      var(--color-paper)
    );
    content: '';
  }

  .task-checkbox[data-checked='true']::before {
    border-color: var(--color-accent);
    background: var(--color-accent);
  }

  .task-check {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    fill: none;
    pointer-events: none;
    stroke: var(--color-paper);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.75;
  }

  .task-checkbox[data-checked='false'] .task-check {
    display: none;
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

    .task-check {
      stroke: HighlightText;
    }
  }
</style>
