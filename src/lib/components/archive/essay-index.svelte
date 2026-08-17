<script lang="ts">
  import type { EssaySummary } from '$lib/content/archive'
  import type { Page } from '$lib/content/pagination'

  import EssayTrajectory from './essay-trajectory.svelte'
  import IndexHeader from './index-header.svelte'
  import Pagination from './pagination.svelte'

  interface Props {
    essays: Page<EssaySummary>
  }

  let { essays }: Props = $props()
</script>

<section id="content" class="essay-index">
  <IndexHeader
    title="随笔"
    description="写下那些值得多停留一会儿的念头。"
  />

  <div class="reading-field">
    <EssayTrajectory entries={essays.entries} />
    <Pagination
      page={essays.page}
      page_count={essays.page_count}
      path="/essays"
    />
  </div>
</section>

<style>
  .essay-index {
    width: min(100%, var(--frame-measure));
    box-sizing: border-box;
    margin: 0 auto;
    padding: clamp(3rem, 8vw, 6.5rem) var(--inline-gutter)
      clamp(4rem, 9vw, 7rem);
  }

  .reading-field {
    width: min(100%, 56rem);
    min-width: 0;
    margin-inline-start: auto;
    border-top: 1px solid var(--color-boundary);
  }
</style>
