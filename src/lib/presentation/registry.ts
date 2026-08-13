import type { Component } from 'svelte'

import type {
  BackgroundProps,
  FooterProps,
  ForegroundProps,
  PresentationSelection,
  RegionSelection,
  RegionOptions,
} from './contract'

const background_components = import.meta.glob<Component<BackgroundProps>>(
  './backgrounds/*/view.svelte',
  {
    eager: true,
    import: 'default',
  },
)

const foreground_components = import.meta.glob<Component<ForegroundProps>>(
  './foregrounds/*/view.svelte',
  {
    eager: true,
    import: 'default',
  },
)

const footer_components = import.meta.glob<Component<FooterProps>>(
  './footers/*/view.svelte',
  {
    eager: true,
    import: 'default',
  },
)

interface ResolvedFooter {
  component: Component<FooterProps>
  options: RegionOptions
}

interface ResolvedBackground {
  component: Component<BackgroundProps>
  options: RegionOptions
}

interface ResolvedForeground {
  component: Component<ForegroundProps>
  options: RegionOptions
}

export interface ResolvedPresentation {
  background?: ResolvedBackground
  footer?: ResolvedFooter
  foreground?: ResolvedForeground
}

function component_for<ComponentType>(
  components: Record<string, ComponentType>,
  path: string,
  region: string,
) {
  const component = components[path]
  if (component) return component
  throw new Error(`Unknown ${region} component at "${path}".`)
}

function resolve_region<ComponentType>(
  selection: RegionSelection | undefined,
  components: Record<string, ComponentType>,
  path_for: (id: string) => string,
  region: string,
) {
  if (!selection) return undefined
  return {
    component: component_for(components, path_for(selection.id), region),
    options: selection.options,
  }
}

export function resolve_presentation(
  selection: PresentationSelection,
): ResolvedPresentation {
  return {
    background: resolve_region(
      selection.background,
      background_components,
      (id) => `./backgrounds/${id}/view.svelte`,
      'background',
    ),
    footer: resolve_region(
      selection.footer,
      footer_components,
      (id) => `./footers/${id}/view.svelte`,
      'footer',
    ),
    foreground: resolve_region(
      selection.foreground,
      foreground_components,
      (id) => `./foregrounds/${id}/view.svelte`,
      'foreground',
    ),
  }
}
