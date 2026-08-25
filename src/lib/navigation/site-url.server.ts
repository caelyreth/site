import { env } from '$env/dynamic/public'

function configured_origin() {
  const origin = env.PUBLIC_SITE_ORIGIN?.trim()
  if (!origin) return undefined

  try {
    return new URL(origin).origin
  } catch {
    return undefined
  }
}

export function site_url(path: string, request_url: URL) {
  if (!path.startsWith('/')) {
    throw new Error(`Expected an absolute site path, received "${path}".`)
  }

  return new URL(path, configured_origin() ?? request_url.origin).href
}
