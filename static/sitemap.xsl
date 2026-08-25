<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="sitemap"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <title>站点地图 / Caelyreth</title>
        <link rel="stylesheet" href="sitemap.css" />
      </head>
      <body>
        <main>
          <header>
            <div>
              <h1>站点地图</h1>
              <p>Caelyreth 深空站公开路径索引。</p>
            </div>
            <div class="count">
              <xsl:value-of select="count(sitemap:urlset/sitemap:url)" />
              条路径
            </div>
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
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <a class="truncate" href="{sitemap:loc}" title="{sitemap:loc}">
                        <xsl:value-of select="sitemap:loc" />
                      </a>
                    </td>
                    <td class="meta">
                      <xsl:choose>
                        <xsl:when test="sitemap:lastmod">
                          <xsl:value-of select="sitemap:lastmod" />
                        </xsl:when>
                        <xsl:otherwise>—</xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </section>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
