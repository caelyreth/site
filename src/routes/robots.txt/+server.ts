import { site_url } from '$lib/navigation/site-url.server'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = false

const cache_control = import.meta.env.DEV
  ? 'no-store'
  : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

export const GET: RequestHandler = ({ url }) =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${site_url('/sitemap.xml', url)}`,
    ].join('\n'),
    {
      headers: {
        'Cache-Control': cache_control,
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
