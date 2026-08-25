import type { SitemapEntry } from '$lib/content/sitemap.server'
import { escape_xml } from '$lib/server/xml'

export function sitemap_document(entries: SitemapEntry[]) {
  const rows = entries
    .map(
      ({ lastmod, path }) => `          <tr>
            <td>
              <a class="truncate" href="${escape_xml(path)}" title="${escape_xml(path)}">${escape_xml(path)}</a>
            </td>
            <td class="meta">${lastmod ?? '&mdash;'}</td>
          </tr>`,
    )
    .join('\n')

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>站点地图 / Caelyreth</title>
    <link rel="stylesheet" href="/sitemap.css" />
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>站点地图</h1>
          <p>Caelyreth 深空站公开路径索引。</p>
        </div>
        <div class="count">${entries.length} 条路径</div>
      </header>
      <section class="table-wrap" aria-label="站点地图路径">
        <table>
          <thead>
            <tr>
              <th class="url-col">路径</th>
              <th class="date-col">最近更新</th>
            </tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </section>
    </main>
  </body>
</html>
`
}
