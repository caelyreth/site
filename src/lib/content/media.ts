import { defineComarkPlugin } from 'comark'
import type { ElementNode, Node } from 'comark'

function is_element(node: Node): node is ElementNode {
  return Array.isArray(node) && node[0] !== null
}

function is_image(node: Node | undefined): node is ElementNode {
  return node !== undefined && is_element(node) && node[0] === 'img'
}

function should_unwrap_media_paragraph(tag: string, children: Node[]) {
  return tag === 'p' && children.length === 1 && is_image(children[0])
}

function normalize_media(node: Node): Node {
  if (!is_element(node)) return node

  const [tag, attributes, ...children] = node
  const normalized_children = children.map(normalize_media)

  // ProseImg renders a figure, which cannot be a child of a paragraph.
  if (should_unwrap_media_paragraph(tag, normalized_children)) {
    return normalized_children[0] as ElementNode
  }

  return [tag, attributes, ...normalized_children]
}

export default defineComarkPlugin(() => ({
  name: 'media',
  post(state) {
    state.tree.nodes = state.tree.nodes.map(normalize_media)
  },
}))
