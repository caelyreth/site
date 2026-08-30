import { defineComarkPlugin, type Node } from 'comark'
import { visit } from 'comark/utils'

interface Options {
  back_ref?: string
  label?: string
}

type ElementNode = [string, Record<string, unknown>, ...Node[]]

const definition_pattern = /^\[\^([^\s\]]+)\]:[ \t]?(.*)$/gm
const definition_tag = 'footnote-definition'

function is_element(node: Node): node is ElementNode {
  return Array.isArray(node) && node[0] !== null
}

function definition_label(node: Node) {
  if (!is_element(node) || node[0] !== definition_tag) return

  const encoded = node[1]['data-footnote']
  if (typeof encoded !== 'string') return

  try {
    return decodeURIComponent(encoded)
  } catch {
    return undefined
  }
}

function is_footnote_ref(node: Node) {
  if (!is_element(node) || node[0] !== 'span' || node.length !== 3) return

  const [_, attributes, value] = node
  if (typeof value !== 'string' || !value.startsWith('^')) return
  if (Object.keys(attributes).some((key) => key !== '$')) return

  const label = value.slice(1)
  return label && !/\s/u.test(label) ? label : undefined
}

export default defineComarkPlugin<Options>((options = {}) => {
  const { back_ref = '↩', label = '脚注' } = options

  return {
    name: 'footnotes',
    pre(state) {
      state.markdown = state.markdown.replace(
        definition_pattern,
        (_match, footnote_label: string, content: string) =>
          `::${definition_tag}{data-footnote="${encodeURIComponent(footnote_label)}"}\n${content}\n::`,
      )
    },
    post(state) {
      const definitions = new Map<string, Node[]>()
      state.tree.nodes = state.tree.nodes.filter((node) => {
        const footnote_label = definition_label(node)
        if (!footnote_label) return true

        definitions.set(footnote_label, node.slice(2) as Node[])
        return false
      })
      if (definitions.size === 0) return

      const references = new Map<string, number>()
      visit(state.tree, is_element, (node) => {
        const footnote_label = is_footnote_ref(node)
        if (!footnote_label || !definitions.has(footnote_label)) return

        const index = references.get(footnote_label) ?? references.size + 1
        references.set(footnote_label, index)
        return [
          'sup',
          { class: 'footnote-ref' },
          [
            'a',
            {
              href: `#fn-${footnote_label}`,
              id: `fnref-${footnote_label}`,
            },
            `[${index}]`,
          ],
        ] satisfies Node
      })
      if (references.size === 0) return

      const items: Node[] = [...references.keys()].map(
        (footnote_label) =>
          [
            'li',
            { id: `fn-${footnote_label}` },
            ...(definitions.get(footnote_label) ?? []),
            ' ',
            [
              'a',
              {
                href: `#fnref-${footnote_label}`,
                class: 'footnote-backref',
              },
              back_ref,
            ],
          ] satisfies Node,
      )

      state.tree.nodes.push([
        'section',
        { class: 'footnotes' },
        ['hr', {}],
        ['h2', { id: 'footnotes' }, label],
        ['ol', { class: 'footnotes-list' }, ...items],
      ] satisfies Node)
    },
  }
})
