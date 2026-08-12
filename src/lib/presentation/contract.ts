import type { Component } from 'svelte'
import type { GenericSchema } from 'valibot'

export type RegionOptions = Record<string, unknown>
export type RegionSchema = GenericSchema<unknown, RegionOptions>

export interface StageSignal {
  color: string
}

export interface StageProps {
  on_signal?: (signal: StageSignal | undefined) => void
  options: RegionOptions
}

export interface StageDefinition {
  component: Component<StageProps>
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
  footer?: RegionSelection
  stage?: RegionSelection
}

export function define_stage(definition: StageDefinition) {
  return definition
}

export function define_footer(definition: FooterDefinition) {
  return definition
}
