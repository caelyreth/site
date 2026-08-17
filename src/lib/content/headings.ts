import type { ElementNode, Node } from 'comark'

export interface HeadingEntry {
  depth: number
  id: string
  text: string
}

function is_element(node: Node): node is ElementNode {
  return Array.isArray(node) && typeof node[0] === 'string'
}

function text_content(nodes: Node[]): string {
  return nodes
    .map((node) => {
      if (typeof node === 'string') return node
      if (!is_element(node)) return ''
      const [, , ...children] = node
      return text_content(children)
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function heading_depth(tag: string) {
  if (!/^h[1-6]$/.test(tag)) return 0
  return Number(tag.slice(1))
}

function is_footnotes_section(tag: string, attributes: ElementNode[1]) {
  return (
    tag === 'section' &&
    typeof attributes.class === 'string' &&
    attributes.class.split(' ').includes('footnotes')
  )
}

function append_heading(
  tag: string,
  attributes: ElementNode[1],
  children: Node[],
  entries: HeadingEntry[],
) {
  const depth = heading_depth(tag)
  const id = typeof attributes.id === 'string' ? attributes.id : ''
  if (!depth || !id) return

  const text = text_content(children)
  if (text) entries.push({ depth, id, text })
}

function collect_headings(nodes: Node[], entries: HeadingEntry[]) {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (!is_element(node)) continue

    const [tag, attributes, ...children] = node
    if (is_footnotes_section(tag, attributes)) continue

    append_heading(tag, attributes, children, entries)
    collect_headings(children, entries)
  }
}

export function extract_headings(nodes: Node[]): HeadingEntry[] {
  const entries: HeadingEntry[] = []
  collect_headings(nodes, entries)
  return entries
}
