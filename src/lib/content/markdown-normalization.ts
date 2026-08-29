import { defineComarkPlugin, type Node } from 'comark'

type Edge = 'cjk' | 'latin' | 'punctuation' | undefined

interface Edges {
  end: Edge
  start: Edge
}

interface Token extends Edges {
  delimiter?: boolean
  raw: string
}

const cjk =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u
const latin = /[A-Za-z0-9]/
const cjk_punctuation = /[，。！？；：、（）【】《》〈〉「」『』]/u
const component_name = /^[a-z$][\w$-]*$/i
const component_boundary =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u2010-\u206f\u3001-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\s*_~\[]/u

function edge(character: string | undefined): Edge {
  if (!character) return undefined
  if (cjk_punctuation.test(character)) return 'punctuation'
  if (cjk.test(character)) return 'cjk'
  if (latin.test(character)) return 'latin'
}

function visible_edges(value: string): Edges {
  const characters = [...value.trim()]
  return {
    end: edge(characters.at(-1)),
    start: edge(characters[0]),
  }
}

function token_edges(tokens: Token[]): Edges {
  let start: Edge
  let end: Edge

  for (const token of tokens) {
    start ??= token.start
    if (token.end) end = token.end
  }

  return { end, start }
}

function is_cjk_edge(value: Edge) {
  return value === 'cjk' || value === 'punctuation'
}

function component_end(source: string, start: number) {
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

function read_component(source: string, start: number) {
  if (
    source[start] !== ':' ||
    (start > 0 && !component_boundary.test(source[start - 1] ?? ''))
  ) {
    return undefined
  }

  const name = source.slice(start + 1).match(/^[\w$-]+/)?.[0]
  if (!name || !component_name.test(name)) return undefined

  const name_end = start + name.length + 1
  if (source[name_end] !== '[') return undefined

  const end = component_end(source, name_end)
  if (!end) return undefined

  return { content_end: end - 1, content_start: name_end + 1, end, name }
}

function read_code_span(source: string, start: number) {
  if (source[start] !== '`') return undefined

  let delimiter_end = start
  while (source[delimiter_end] === '`') delimiter_end += 1
  const delimiter = source.slice(start, delimiter_end)
  const end = source.indexOf(delimiter, delimiter_end)
  if (end < 0) return undefined

  return {
    content_end: end,
    content_start: delimiter_end,
    end: end + delimiter.length,
  }
}

function closing_bracket(source: string, start: number) {
  let depth = 0

  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index]
    if (character === '\\') {
      index += 1
      continue
    }
    if (character === ']' && depth === 0) return index
    if (character === '[') depth += 1
    if (character === ']') depth -= 1
  }
}

function closing_parenthesis(source: string, start: number) {
  let depth = 0

  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index]
    if (character === '\\') {
      index += 1
      continue
    }
    if (character === ')' && depth === 0) return index
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
  }
}

function read_link(source: string, start: number) {
  const label_start = source[start] === '!' ? start + 1 : start
  if (source[label_start] !== '[') return undefined

  const label_end = closing_bracket(source, label_start)
  if (label_end === undefined || source[label_end + 1] !== '(')
    return undefined

  const destination_end = closing_parenthesis(source, label_end + 1)
  if (destination_end === undefined) return undefined

  return { end: destination_end + 1, label_end, label_start }
}

function closing_delimiter(
  source: string,
  start: number,
  delimiter: string,
) {
  for (let index = start; index < source.length;) {
    index = source.indexOf(delimiter, index)
    if (index < 0) return undefined

    let escapes = 0
    for (let cursor = index - 1; source[cursor] === '\\'; cursor -= 1) {
      escapes += 1
    }
    if (escapes % 2 === 0) return index
    index += delimiter.length
  }
}

function read_emphasis(source: string, start: number) {
  const marker = source[start]
  if (marker !== '*' && marker !== '_') return undefined

  let length = 1
  while (source[start + length] === marker) length += 1
  if (length > 3) return undefined

  const delimiter = marker.repeat(length)
  const end = closing_delimiter(source, start + delimiter.length, delimiter)
  if (end === undefined) return undefined

  return {
    content_end: end,
    content_start: start + delimiter.length,
    end: end + delimiter.length,
  }
}

function read_strikethrough(source: string, start: number) {
  if (!source.startsWith('~~', start)) return undefined
  const end = closing_delimiter(source, start + 2, '~~')
  if (end === undefined) return undefined

  return { content_end: end, content_start: start + 2, end: end + 2 }
}

function normalize_text(value: string) {
  return value
    .replace(/[ \t]+([，。！？；：、）】》〉」』])/gu, '$1')
    .replace(/([（【《〈「『])[ \t]+/gu, '$1')
    .replace(/([，。！？；：、])[ \t]+/gu, '$1')
    .replace(
      /([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])[ \t]*([A-Za-z0-9])/gu,
      '$1 $2',
    )
    .replace(
      /([A-Za-z0-9])[ \t]*([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu,
      '$1 $2',
    )
}

function standalone_component_line(line: string) {
  const leading = line.match(/^[ \t]*/)?.[0].length ?? 0
  if (line[leading] !== '[') return line

  let start = leading + 1
  while (/[ \t]/.test(line[start] ?? '')) start += 1
  const component = read_component(line, start)
  if (!component) return line

  let end = component.end
  while (/[ \t]/.test(line[end] ?? '')) end += 1
  if (line[end] !== ']' || line.slice(end + 1).trim()) return line

  return `${line.slice(0, leading)}${line.slice(start, component.end)}${line.slice(end + 1)}`
}

function join(tokens: Token[], parser_spacing = false) {
  let output = ''
  let previous: Edge

  for (const [index, token] of tokens.entries()) {
    let raw = token.raw
    const next = token.start
    const preceding = tokens[index - 1]
    const has_boundary_space = /[ \t]$/.test(output) || /^[ \t]/.test(raw)

    if (previous && next && has_boundary_space) {
      const no_space =
        previous === 'punctuation' ||
        next === 'punctuation' ||
        (previous === 'cjk' && next === 'cjk')
      const needs_space =
        (previous === 'cjk' && next === 'latin') ||
        (previous === 'latin' && next === 'cjk')

      if (no_space || needs_space) {
        output = output.replace(/[ \t]+$/, '')
        raw = raw.replace(/^[ \t]+/, '')
        if (needs_space) output += ' '
      }
    } else if (
      previous &&
      next &&
      ((previous === 'cjk' && next === 'latin') ||
        (previous === 'latin' && next === 'cjk'))
    ) {
      output += ' '
    }

    if (
      parser_spacing &&
      token.delimiter &&
      previous === 'cjk' &&
      is_cjk_edge(next)
    ) {
      output = output.replace(/[ \t]+$/, '')
      raw = raw.replace(/^[ \t]+/, '')
      output += ' '
    }

    if (
      parser_spacing &&
      preceding?.delimiter &&
      is_cjk_edge(preceding.end) &&
      next === 'cjk'
    ) {
      output = output.replace(/[ \t]+$/, '')
      raw = raw.replace(/^[ \t]+/, '')
      output += ' '
    }

    output += raw
    previous = token.end ?? previous
  }

  return output
}

function normalize_tokens(
  source: string,
  parser_spacing: boolean,
): Token[] {
  const tokens: Token[] = []
  let text = ''

  function push_text() {
    if (!text) return
    const raw = normalize_text(text)
    tokens.push({ raw, ...visible_edges(raw) })
    text = ''
  }

  function push_atom(raw: string, edges: Edges, delimiter = false) {
    push_text()
    tokens.push({ raw, delimiter, ...edges })
  }

  for (let index = 0; index < source.length;) {
    if (source[index] === '\\') {
      text += source.slice(index, index + 2)
      index += 2
      continue
    }

    const component = read_component(source, index)
    if (component) {
      const content_tokens = normalize_tokens(
        source.slice(component.content_start, component.content_end).trim(),
        parser_spacing,
      )
      const content = join(content_tokens, parser_spacing)
      push_atom(
        `:${component.name}[${content}]`,
        token_edges(content_tokens),
      )
      index = component.end
      continue
    }

    const code = read_code_span(source, index)
    if (code) {
      const raw = source.slice(index, code.end)
      push_atom(
        raw,
        visible_edges(source.slice(code.content_start, code.content_end)),
      )
      index = code.end
      continue
    }

    const link = read_link(source, index)
    if (link) {
      const prefix = source.slice(index, link.label_start + 1)
      const label_tokens = normalize_tokens(
        source.slice(link.label_start + 1, link.label_end),
        parser_spacing,
      )
      const label = join(label_tokens, parser_spacing)
      const destination = source.slice(link.label_end, link.end)
      push_atom(
        `${prefix}${label}${destination}`,
        token_edges(label_tokens),
      )
      index = link.end
      continue
    }

    const emphasis =
      read_emphasis(source, index) ?? read_strikethrough(source, index)
    if (emphasis) {
      const opening = source.slice(index, emphasis.content_start)
      const content_tokens = normalize_tokens(
        source.slice(emphasis.content_start, emphasis.content_end),
        parser_spacing,
      )
      const content = join(content_tokens, parser_spacing)
      const closing = source.slice(emphasis.content_end, emphasis.end)
      push_atom(
        `${opening}${content}${closing}`,
        token_edges(content_tokens),
        true,
      )
      index = emphasis.end
      continue
    }

    text += source[index]
    index += 1
  }

  push_text()
  return tokens
}

function normalize_inline(source: string, parser_spacing = false) {
  return join(normalize_tokens(source, parser_spacing), parser_spacing)
}

function normalize_source(source: string, parser_spacing = false) {
  const lines = source.split(/(\r?\n)/)
  let fenced: string | undefined

  return lines
    .map((line) => {
      const marker = line.match(/^(?:`{3,}|~{3,})/)?.[0]
      if (marker) {
        if (!fenced) fenced = marker
        else if (marker.startsWith(fenced[0] ?? '')) fenced = undefined
        return line
      }
      if (fenced || line === '\n' || line === '\r\n') return line
      return normalize_inline(
        standalone_component_line(line),
        parser_spacing,
      )
    })
    .join('')
}

export function normalize_markdown(source: string) {
  return normalize_source(source)
}

function node_edges(node: Node): { end: Edge; start: Edge } {
  if (typeof node === 'string') return visible_edges(node)
  if (node[0] === null) return { end: undefined, start: undefined }

  const children = node.slice(2) as Node[]
  let start: Edge
  let end: Edge

  for (const child of children) {
    const edges = node_edges(child)
    start ??= edges.start
    if (edges.end) end = edges.end
  }

  return { end, start }
}

function trim_parser_spacing(nodes: Node[], start = 0) {
  for (const node of nodes.slice(start)) {
    if (typeof node !== 'string' && node[0] !== null) {
      trim_parser_spacing(node as Node[], 2)
    }
  }

  for (let index = start; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (
      typeof node === 'string' ||
      !['del', 'em', 'strong'].includes(node[0] ?? '')
    ) {
      continue
    }

    const edges = node_edges(node)
    const before = nodes[index - 1]
    if (
      typeof before === 'string' &&
      node_edges(before).end === 'cjk' &&
      is_cjk_edge(edges.start)
    ) {
      nodes[index - 1] = before.replace(/[ \t]+$/, '')
    }

    const after = nodes[index + 1]
    if (
      typeof after === 'string' &&
      is_cjk_edge(edges.end) &&
      node_edges(after).start === 'cjk'
    ) {
      nodes[index + 1] = after.replace(/^[ \t]+/, '')
    }
  }
}

export default defineComarkPlugin(() => ({
  name: 'markdown-normalization',
  pre(state) {
    state.markdown = normalize_source(state.markdown, true)
  },
  post(state) {
    trim_parser_spacing(state.tree?.nodes ?? [])
  },
}))
