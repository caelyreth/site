import { resolve } from '$app/paths'

const resolve_path = resolve as (path: string) => string

export function site_href(path: string) {
  if (!path.startsWith('/')) {
    throw new Error(`Expected an absolute site path, received "${path}".`)
  }

  return resolve_path(path)
}
