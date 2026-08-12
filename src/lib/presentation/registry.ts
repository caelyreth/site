import type { Component } from 'svelte'

import type {
  FooterProps,
  PresentationSelection,
  RegionOptions,
  StageProps,
} from './contract'

const stage_components = import.meta.glob('./stages/*/view.svelte', {
  eager: true,
  import: 'default',
}) as Record<string, Component<StageProps>>

const footer_components = import.meta.glob('./footers/*/view.svelte', {
  eager: true,
  import: 'default',
}) as Record<string, Component<FooterProps>>

interface ResolvedFooter {
  component: Component<FooterProps>
  options: RegionOptions
}

interface ResolvedStage {
  component: Component<StageProps>
  options: RegionOptions
}

export interface ResolvedPresentation {
  footer?: ResolvedFooter
  stage?: ResolvedStage
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

export function resolve_presentation(
  selection: PresentationSelection,
): ResolvedPresentation {
  return {
    footer: selection.footer
      ? {
          component: component_for(
            footer_components,
            `./footers/${selection.footer.id}/view.svelte`,
            'footer',
          ),
          options: selection.footer.options,
        }
      : undefined,
    stage: selection.stage
      ? {
          component: component_for(
            stage_components,
            `./stages/${selection.stage.id}/view.svelte`,
            'stage',
          ),
          options: selection.stage.options,
        }
      : undefined,
  }
}
