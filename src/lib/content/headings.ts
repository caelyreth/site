import type { ElementNode, Node } from 'comark'

export interface HeadingEntry {
  depth: number
  id: string
  text: string
}

function is_element(node: Node): node is ElementNode {
  return Array.isArray(node) && typeof node[0] === 'string'
}

function heading_text(nodes: Node[]): string {
  return nodes
    .map((node) => {
      if (typeof node === 'string') return node
      if (!is_element(node)) return ''
      const [, , ...children] = node
      return heading_text(children)
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function heading_slug(text: string, index: number) {
  const slug = text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\-\s]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || `section-${index}`
}

function explicit_heading_id(attributes: ElementNode[1]) {
  const { id } = attributes
  return typeof id === 'string' && id ? id : undefined
}

function heading_id(
  attributes: ElementNode[1],
  children: Node[],
  index: number,
) {
  return (
    explicit_heading_id(attributes) ??
    heading_slug(heading_text(children), index)
  )
}

function unique_heading_id(id: string, counts: Map<string, number>) {
  const count = counts.get(id) ?? 0
  counts.set(id, count + 1)
  return count ? `${id}-${count + 1}` : id
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

  const text = heading_text(children)
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

export function ensure_heading_ids(nodes: Node[]) {
  const counts = new Map<string, number>()
  let index = 0

  function assign_id(node: ElementNode) {
    const [tag, attributes, ...children] = node
    if (!heading_depth(tag)) return

    index += 1
    attributes.id = unique_heading_id(
      heading_id(attributes, children, index),
      counts,
    )
  }

  function visit(current_nodes: Node[]) {
    for (const node of current_nodes.filter(is_element)) {
      const [, , ...children] = node
      assign_id(node)
      visit(children)
    }
  }

  visit(nodes)
}
