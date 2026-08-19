<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children: Snippet
    compact_control?: boolean
    control?: string
    priority?: 'primary' | 'secondary'
  }

  let {
    children,
    compact_control = false,
    control,
    priority = 'secondary',
  }: Props = $props()
</script>

<div
  class="rail-cell"
  data-rail-cell
  data-rail-compact-control={compact_control ? '' : undefined}
  data-rail-control={control}
  data-rail-priority={priority}
>
  {@render children()}
</div>
