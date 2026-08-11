import type { Component } from 'svelte'

const components = import.meta.glob('./*.svelte', {
  eager: true,
  import: 'default',
}) as Record<string, Component>

export function resolve_comark_component(name: string) {
  return (
    components[`./prose-${name}.svelte`] ?? components[`./${name}.svelte`]
  )
}
