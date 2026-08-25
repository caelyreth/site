import { feed_data } from '$lib/content/feed.server'
import { site_url } from '$lib/navigation/site-url.server'
import { escape_xml, feed_rfc822_date } from '$lib/server/xml'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = false

const cache_control = import.meta.env.DEV
  ? 'no-store'
  : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

export const GET: RequestHandler = async ({ url }) => {
  const { entries, site } = await feed_data()
  const feed_url = site_url('/rss.xml', url)
  const home_url = site_url('/', url)
  const updated =
    entries[0]?.updated ?? new Date().toISOString().slice(0, 10)
  const items = entries
    .map((entry) => {
      const link = site_url(entry.path, url)
      const categories = entry.constellations
        .map(
          (constellation) =>
            `\n      <category domain="${escape_xml(site_url(`/constellations/${constellation.id}`, url))}">${escape_xml(constellation.title)}</category>`,
        )
        .join('')

      return `    <item>
      <title>${escape_xml(entry.title)}</title>
      <link>${escape_xml(link)}</link>
      <guid isPermaLink="true">${escape_xml(link)}</guid>
      <pubDate>${feed_rfc822_date(entry.published)}</pubDate>
      <description>${escape_xml(entry.summary)}</description>${categories}
    </item>`
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape_xml(site.title)}</title>
    <link>${escape_xml(home_url)}</link>
    <description>${escape_xml(site.description)}</description>
    <language>${escape_xml(site.seo.locale.replace('_', '-'))}</language>
    <atom:link href="${escape_xml(feed_url)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${feed_rfc822_date(updated)}</lastBuildDate>
${items}
  </channel>
</rss>
`

  return new Response(body, {
    headers: {
      'Cache-Control': cache_control,
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
