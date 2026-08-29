import {
  defineComarkPlugin,
  type MarkdownItPlugin,
  type Node,
} from 'comark'

const default_boundaries = new Set([' ', '\t', '\n', '*', '_', '~', '['])
const inline_block_marker = 'data-comark-inline-block'
const cjk_or_punctuation =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u2010-\u206f\u3001-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u
const component_name = /^[a-z$][\w$-]*$/i

interface InlineState {
  md: {
    inline: {
      tokenize(state: InlineState): void
    }
  }
  pos: number
  posMax: number
  src: string
  push(type: string, tag: string, nesting: -1 | 0 | 1): void
}

interface InlineRuleHost {
  core: {
    ruler: {
      after(name: string, rule_name: string, rule: CoreRule): void
    }
  }
  inline: {
    ruler: {
      at(name: string, rule: InlineRule): void
    }
  }
}

interface BlockToken {
  attrSet(name: string, value: string): void
  level: number
  nesting: -1 | 0 | 1
  type: string
}

interface CoreState {
  tokens: BlockToken[]
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
type CoreRule = (state: CoreState) => void

function component_boundary(source: string, start: number) {
  if (start === 0) return true

  const previous = source[start - 1] ?? ''
  return (
    default_boundaries.has(previous) || cjk_or_punctuation.test(previous)
  )
}

function bracket_content_end(source: string, start: number) {
  let depth = 0

  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index]
    if (character === '\\') {
      index += 1
      continue
    }
    if (character === ']' && depth === 0) return index + 1
    if (character === '[') depth += 1
    if (character === ']') depth -= 1
  }
}

function read_inline_component(source: string, start: number) {
  const name = source.slice(start + 1).match(/^[\w$-]+/)?.[0]
  if (!name || !component_name.test(name)) return undefined

  const name_end = start + name.length + 1
  if (source[name_end] !== '[') return { end: name_end, name }

  const end = bracket_content_end(source, name_end)
  if (!end) return undefined

  return {
    content: { end: end - 1, start: name_end + 1 },
    end,
    name,
  } satisfies InlineComponent
}

const parse_inline_component: InlineRule = (state, silent) => {
  const start = state.pos
  if (state.src[start] !== ':' || !component_boundary(state.src, start)) {
    return false
  }

  const component = read_inline_component(state.src, start)
  if (!component) return false

  state.pos = component.end
  if (silent) return true

  if (!component.content) {
    state.push('mdc_inline_component', component.name, 0)
    return true
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
  return true
}

function mark_standalone_inline_components(state: CoreState) {
  for (const token of state.tokens) {
    if (
      token.type !== 'mdc_block_shorthand' ||
      token.nesting === -1 ||
      token.level !== 0
    ) {
      continue
    }

    token.attrSet(inline_block_marker, '')
  }
}

const inline_components: MarkdownItPlugin = (markdown) => {
  const { core, inline } = markdown as unknown as InlineRuleHost
  inline.ruler.at('comark_inline_component', parse_inline_component)
  core.ruler.after(
    'block',
    'mark_standalone_inline_components',
    mark_standalone_inline_components,
  )
}

function wrap_standalone_inline_components(nodes: Node[]) {
  return nodes.map((node) => {
    if (!Array.isArray(node) || node[0] === null) return node

    const [tag, attributes, ...children] = node
    if (!(inline_block_marker in attributes)) {
      return node
    }

    const { [inline_block_marker]: _, ...component_attributes } = attributes
    return [
      'p',
      {},
      [tag, component_attributes, ...children],
    ] satisfies Node
  })
}

export default defineComarkPlugin(() => ({
  name: 'inline-components',
  markdownItPlugins: [inline_components],
  post(state) {
    if (!state.tree) return
    state.tree.nodes = wrap_standalone_inline_components(state.tree.nodes)
  },
}))
