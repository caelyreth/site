import { load_content_page } from '$lib/content/repository.server'

export const prerender = true

export async function load() {
  return {
    content: await load_content_page('home'),
  }
}
