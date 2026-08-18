import { createContext } from 'svelte'

import type { SiteConfig } from './schema'

export const [get_site_config, set_site_config] = createContext<{
  current: SiteConfig
}>()

export function format_template(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}

export function site_title(site: SiteConfig, ...parts: string[]) {
  return [...parts, site.title].join(site.seo.title_separator)
}
