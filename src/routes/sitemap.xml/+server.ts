import { sitemap_entries } from '$lib/content/sitemap.server'
import { site_url } from '$lib/navigation/site-url.server'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = false

const cache_control = import.meta.env.DEV
  ? 'no-store'
  : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

function escape_xml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }
    return entities[character]
  })
}

export const GET: RequestHandler = async ({ url }) => {
  const entries = await sitemap_entries()
  const urls = entries
    .map(({ lastmod, path }) => {
      const location = `<loc>${escape_xml(site_url(path, url))}</loc>`
      const modified = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
      return `  <url>\n    ${location}${modified}\n  </url>`
    })
    .join('\n')

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Cache-Control': cache_control,
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
