import {
  sitemap_entries,
  type SitemapEntry,
} from '$lib/content/sitemap.server'
import { site_url } from '$lib/navigation/site-url.server'
import { sitemap_document } from '$lib/presentation/sitemap/document.server'
import { escape_xml } from '$lib/server/xml'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = false

const cache_control = import.meta.env.DEV
  ? 'no-store'
  : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

function is_browser_document_request(request: Request) {
  return (
    request.headers.get('sec-fetch-dest') === 'document' &&
    request.headers.get('accept')?.includes('text/html') === true
  )
}

function sitemap_xml(entries: SitemapEntry[], url: URL) {
  const urls = entries
    .map(({ lastmod, path }) => {
      const location = `<loc>${escape_xml(site_url(path, url))}</loc>`
      const modified = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
      return `  <url>\n    ${location}${modified}\n  </url>`
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n')
}

export const GET: RequestHandler = async ({ request, url }) => {
  const entries = await sitemap_entries()
  const html = is_browser_document_request(request)
  const body = html ? sitemap_document(entries) : sitemap_xml(entries, url)

  return new Response(body, {
    headers: {
      'Cache-Control': cache_control,
      'Content-Type': html
        ? 'text/html; charset=utf-8'
        : 'application/xml; charset=utf-8',
      'Vary': 'Accept, Sec-Fetch-Dest',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
