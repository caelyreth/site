import { defineComarkPlugin, type MarkdownItPlugin } from 'comark'

const allowed_previous_characters = new Set([
  ' ',
  '\t',
  '\n',
  '*',
  '_',
  '[',
])
const cjk_boundary =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u2010-\u206f\u3001-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u
const component_name = /^[a-z$][\w$-]*$/i

interface InlineState {
  md: {
    inline: {
      tokenize(state: InlineState): void
    }
  }
  pending: string
  pos: number
  posMax: number
  src: string
  push(type: string, tag: string, nesting: -1 | 0 | 1): void
}

interface InlineRuleHost {
  inline: {
    ruler: {
      at(name: string, rule: InlineRule): void
    }
  }
}

interface InlineComponent {
  content?: {
    end: number
    start: number
  }
  end: number
  name: string
}

type InlineRule = (state: InlineState, silent: boolean) => boolean

function is_component_boundary(source: string, start: number) {
  if (start === 0) return true

  const previous = source[start - 1]
  return (
    allowed_previous_characters.has(previous) || cjk_boundary.test(previous)
  )
}

function cjk_boundary_offset(source: string, start: number) {
  let index = start
  while (index > 0 && /[ \t]/.test(source[index - 1])) index -= 1

  return cjk_boundary.test(source[index - 1] ?? '') ? index : undefined
}

function following_cjk_space_end(source: string, start: number) {
  let index = start
  while (/[ \t]/.test(source[index])) index += 1

  return index > start && cjk_boundary.test(source[index]) ? index : start
}

const bracket_depth_change: Record<string, number> = { '[': 1, ']': -1 }

function is_closing_content_bracket(character: string, depth: number) {
  return character === ']' && depth === 0
}

function next_bracket_depth(depth: number, character: string) {
  return depth + (bracket_depth_change[character] || 0)
}

function bracket_content_end(source: string, start: number) {
  let depth = 0

  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index]
    if (character === '\\') {
      index += 1
      continue
    }
    if (is_closing_content_bracket(character, depth)) return index + 1
    depth = next_bracket_depth(depth, character)
  }
}

function read_inline_content(source: string, start: number) {
  if (source[start] !== '[') return undefined

  const end = bracket_content_end(source, start)
  if (!end) return undefined

  return { end, start: start + 1 }
}

function component_name_at(source: string, start: number) {
  const name = source.slice(start + 1).match(/^[\w$-]+/)?.[0]
  if (!name) return undefined
  if (!component_name.test(name)) return undefined
  return name
}

function inline_component(
  name: string,
  name_end: number,
  content: ReturnType<typeof read_inline_content>,
) {
  const component: InlineComponent = { end: content?.end ?? name_end, name }
  if (content) {
    component.content = { end: content.end - 1, start: content.start }
  }
  return component
}

function read_inline_component(source: string, start: number) {
  const name = component_name_at(source, start)
  if (!name) return undefined

  const name_end = start + 1 + name.length
  const content = read_inline_content(source, name_end)
  return inline_component(name, name_end, content)
}

function push_inline_component(
  state: InlineState,
  component: InlineComponent,
) {
  if (!component.content) {
    state.push('mdc_inline_component', component.name, 0)
    return
  }

  state.push('mdc_inline_component', component.name, 1)
  const previous_position = state.pos
  const previous_position_max = state.posMax
  state.pos = component.content.start
  state.posMax = component.content.end
  state.md.inline.tokenize(state)
  state.pos = previous_position
  state.posMax = previous_position_max
  state.push('mdc_inline_component', component.name, -1)
}

function is_inline_component_start(state: InlineState) {
  return (
    state.src[state.pos] === ':' &&
    is_component_boundary(state.src, state.pos)
  )
}

function prepare_cjk_component_boundary(
  state: InlineState,
  start: number,
  end: number,
) {
  const boundary = cjk_boundary_offset(state.src, start)
  if (boundary === undefined) return end

  if (boundary < start) {
    state.pending = state.pending.replace(/[ \t]+$/, '')
  }
  return following_cjk_space_end(state.src, end)
}

const parse_inline_component: InlineRule = (state, silent) => {
  const start = state.pos
  if (!is_inline_component_start(state)) return false

  const component = read_inline_component(state.src, start)
  if (!component) return false

  state.pos = prepare_cjk_component_boundary(state, start, component.end)
  if (silent) return true

  push_inline_component(state, component)
  return true
}

const cjk_inline_components: MarkdownItPlugin = (markdown) => {
  const { inline } = markdown as unknown as InlineRuleHost
  // Comark does not expose the component boundary as an option.
  inline.ruler.at('comark_inline_component', parse_inline_component)
}

export default defineComarkPlugin(() => ({
  name: 'cjk-inline-components',
  markdownItPlugins: [cjk_inline_components],
}))
