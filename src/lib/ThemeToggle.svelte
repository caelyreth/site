<script lang="ts">
  let dark = $state(false)

  $effect(() => {
    dark = document.documentElement.classList.contains('dark')
  })

  function toggle() {
    dark = !dark
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-pressed={dark}
  title={dark ? 'Light mode' : 'Dark mode'}
  grid
  place-items-center
  size-9
  rounded-full
  cursor-pointer
  border="1 rule"
  text="ink-2 hover:ink"
  bg="hover:paper-2"
  transition-colors
  duration-120
  ease-out
>
  <span
    class={dark ? 'i-ri-sun-line' : 'i-ri-moon-line'}
    text-lg
    aria-hidden="true"
  ></span>
</button>
