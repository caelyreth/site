import { feed_data } from '$lib/content/feed.server'
import { site_url } from '$lib/navigation/site-url.server'
import { escape_xml, feed_iso_date } from '$lib/server/xml'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = false

const cache_control = import.meta.env.DEV
  ? 'no-store'
  : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

export const GET: RequestHandler = async ({ url }) => {
  const { entries, site } = await feed_data()
  const feed_url = site_url('/atom.xml', url)
  const home_url = site_url('/', url)
  const updated = feed_iso_date(
    entries[0]?.updated ?? new Date().toISOString().slice(0, 10),
  )
  const items = entries
    .map((entry) => {
      const link = site_url(entry.path, url)
      const categories = entry.constellations
        .map(
          (constellation) =>
            `\n    <category term="${escape_xml(constellation.id)}" label="${escape_xml(constellation.title)}" />`,
        )
        .join('')

      return `  <entry>
    <title>${escape_xml(entry.title)}</title>
    <link href="${escape_xml(link)}" />
    <id>urn:caelyreth:entry:${escape_xml(entry.collection)}:${escape_xml(entry.id)}</id>
    <published>${feed_iso_date(entry.published)}</published>
    <updated>${feed_iso_date(entry.updated)}</updated>${categories}
    <summary type="text">${escape_xml(entry.summary)}</summary>
  </entry>`
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escape_xml(site.title)}</title>
  <subtitle>${escape_xml(site.description)}</subtitle>
  <link href="${escape_xml(feed_url)}" rel="self" type="application/atom+xml" />
  <link href="${escape_xml(home_url)}" />
  <id>${escape_xml(home_url)}</id>
  <updated>${updated}</updated>
${items}
</feed>
`

  return new Response(body, {
    headers: {
      'Cache-Control': cache_control,
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
