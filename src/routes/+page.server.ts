import { load_content } from '$lib/content/repository.server'

export const prerender = true

export async function load() {
  return {
    document: await load_content('home'),
  }
}
