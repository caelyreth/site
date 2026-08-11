import type { Component } from 'svelte'

const components = import.meta.glob('./blocks/*.svelte', {
  eager: true,
  import: 'default',
}) as Record<string, Component>

export function resolve_comark_component(name: string) {
  return (
    components[`./blocks/prose-${name}.svelte`] ??
    components[`./blocks/${name}.svelte`]
  )
}
