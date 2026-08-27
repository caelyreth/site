<script lang="ts">
  import type { Friend } from '$lib/content/schema'

  interface Props {
    friends: Friend[]
  }

  let { friends }: Props = $props()

  function reveal_avatar(image: HTMLImageElement) {
    const reveal = () => {
      image.dataset.loaded = ''
    }

    if (image.complete) reveal()
    else {
      image.addEventListener('load', reveal, { once: true })
      image.addEventListener('error', reveal, { once: true })
    }
  }
</script>

<section class="friend-list" aria-label="朋友列表">
  <ul>
    {#each friends as friend (friend.link)}
      <li>
        <a href={friend.link} rel="noreferrer" target="_blank">
          <img
            {@attach reveal_avatar}
            alt=""
            decoding="async"
            loading="lazy"
            src={friend.avatar_url}
          />
          <span class="friend-copy">
            <span class="friend-name">{friend.name}</span>
            <span class="friend-description">{friend.description}</span>
          </span>
          <span aria-hidden="true" class="i-ri-arrow-up-right-line"></span>
        </a>
      </li>
    {/each}
  </ul>
</section>

<style>
  .friend-list {
    width: calc(100% + var(--inline-gutter) * 2);
    margin-inline: calc(-1 * var(--inline-gutter));
    padding: clamp(1.125rem, 2.75vw, 1.75rem) var(--inline-gutter) 0;
  }

  ul {
    display: grid;
    margin: 0;
    padding: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.625rem;
    list-style: none;
  }

  li {
    min-width: 0;
  }

  li > a {
    display: flex;
    min-width: 0;
    min-height: 4.25rem;
    padding: 0.625rem;
    border: 1px solid var(--color-boundary);
    align-items: center;
    gap: 0.625rem;
    color: var(--color-text);
    text-decoration: none;
    transition:
      border-color var(--dur-short) var(--ease-out),
      color var(--dur-short) var(--ease-out),
      background-color var(--dur-short) var(--ease-out);
  }

  img {
    display: block;
    width: 2.25rem;
    height: 2.25rem;
    flex: none;
    border-radius: 50%;
    background: var(--color-guide);
    object-fit: cover;
    opacity: 0;
    transition:
      opacity var(--dur-long) var(--ease-out),
      filter var(--dur-long) var(--ease-out);
    filter: blur(0.25rem);
  }

  img:global([data-loaded]) {
    opacity: 1;
    filter: none;
  }

  .friend-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.15rem;
  }

  .friend-name {
    overflow: hidden;
    font-family: var(--font-stack-serif);
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .friend-description {
    overflow: hidden;
    color: var(--color-muted);
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  li > a > span:last-child {
    flex: none;
    font-family: var(--font-stack-sans);
    font-size: 0.875em;
    transition: transform var(--dur-short) var(--ease-out);
  }

  li > a::after {
    display: none;
  }

  @media (hover: hover) {
    li > a:hover {
      border-color: var(--color-text-link);
      color: var(--color-text-link);
      background: color-mix(
        in oklab,
        var(--color-text-link) 6%,
        transparent
      );
    }

    li > a:hover > span:last-child {
      transform: translate(0.15rem, -0.15rem);
    }

    li > a:hover .friend-description {
      color: currentColor;
      opacity: 0.78;
    }
  }

  li > a:focus-visible {
    border-color: var(--color-focus);
    outline: 2px solid var(--color-focus);
    outline-offset: 0.2rem;
  }

  @media (width < 34rem) {
    ul {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }
</style>
