<script lang="ts">
  import Scene from '$lib/components/observatory/scene.svelte'
  import Content from '$lib/components/station/content.svelte'
</script>

<svelte:head>
  <title>Caelyreth</title>
  <script>
    document.documentElement.dataset.observatoryPending = 'true'
  </script>
</svelte:head>

<Scene />
<div class="deck station-content">
  <Content />
</div>

<style>
  .station-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    padding-inline: var(--inline-gutter);
  }
</style>
