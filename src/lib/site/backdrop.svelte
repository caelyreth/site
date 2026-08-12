<script lang="ts">
  import Guide from './guide.svelte'
</script>

<div aria-hidden="true" class="field-surface hatch"></div>
<Guide side="left" />
<Guide side="right" />

<style>
  .hatch {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
</style>
