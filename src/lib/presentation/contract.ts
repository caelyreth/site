import type { Component } from 'svelte'
import * as v from 'valibot'

export type RegionOptions = Record<string, unknown>
export type RegionSchema = v.GenericSchema<unknown, RegionOptions>

export interface PresentationSignal {
  color: string
}

export interface BackgroundProps {
  on_signal?: (signal: PresentationSignal | undefined) => void
  options: RegionOptions
}

export interface BackgroundDefinition {
  component: Component<BackgroundProps>
  id: string
  options: RegionSchema
}

export interface ForegroundProps {
  options: RegionOptions
  signal?: PresentationSignal
}

export interface ForegroundDefinition {
  component: Component<ForegroundProps>
  id: string
  options: RegionSchema
}

export interface FooterProps {
  options: RegionOptions
  visible: boolean
}

export interface FooterDefinition {
  component: Component<FooterProps>
  id: string
  options: RegionSchema
}

export interface RegionSelection {
  id: string
  options: RegionOptions
}

export interface PresentationSelection {
  background?: RegionSelection
  footer?: RegionSelection
  foreground?: RegionSelection
}

export const empty_options_schema = v.pipe(
  v.undefined(),
  v.transform((): RegionOptions => ({})),
)
