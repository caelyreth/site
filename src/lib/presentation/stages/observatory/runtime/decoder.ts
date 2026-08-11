/* oxlint-disable complexity -- Packed sky data decoding performs connected-component discovery in one pass. */
/* oxlint-disable typescript/prefer-readonly-parameter-types -- generated typed arrays are consumed as a shared payload. */
import { EDGE_WEIGHT_BY_CLASS } from './constants'
import type { DecodedSkyMap, SkyMapPayload } from './types'

export function decode_sky_map(sky_data: SkyMapPayload): DecodedSkyMap {
  const { SKY_EDGES, SKY_NODES, SKY_NODE_STRIDE } = sky_data
  const node_count = SKY_NODES.length / SKY_NODE_STRIDE
  const edge_count = SKY_EDGES.length / 3
  const directions = new Float32Array(node_count * 3)
  const magnitudes = new Float32Array(node_count)
  const edge_nodes = new Uint16Array(edge_count * 2)
  const edge_groups = new Uint16Array(edge_count)
  const edge_weights = new Float32Array(edge_count)
  const parents = new Uint16Array(node_count)
  const node_groups = new Int16Array(node_count)
  node_groups.fill(-1)

  for (let index = 0; index < node_count; index += 1) {
    parents[index] = index
  }

  const find_group = (node: number) => {
    let parent = node
    while (parents[parent] !== parent) {
      parents[parent] = parents[parents[parent]]
      parent = parents[parent]
    }
    return parent
  }

  for (let index = 0; index < node_count; index += 1) {
    const packed = index * SKY_NODE_STRIDE
    const point = index * 3
    directions[point] = SKY_NODES[packed] / 32767
    directions[point + 1] = SKY_NODES[packed + 1] / 32767
    directions[point + 2] = SKY_NODES[packed + 2] / 32767
    magnitudes[index] = SKY_NODES[packed + 3] / 100
  }

  for (let index = 0; index < edge_count; index += 1) {
    const packed = index * 3
    const edge = index * 2
    edge_nodes[edge] = SKY_EDGES[packed]
    edge_nodes[edge + 1] = SKY_EDGES[packed + 1]
    edge_weights[index] = EDGE_WEIGHT_BY_CLASS[SKY_EDGES[packed + 2] - 1]
    const start_group = find_group(edge_nodes[edge])
    const end_group = find_group(edge_nodes[edge + 1])
    if (start_group !== end_group) parents[end_group] = start_group
  }

  const group_by_root = new Map<number, number>()
  for (let index = 0; index < edge_count; index += 1) {
    const edge = index * 2
    const start = edge_nodes[edge]
    const end = edge_nodes[edge + 1]
    const root = find_group(edge_nodes[edge])
    let group = group_by_root.get(root)
    if (group === undefined) {
      group = group_by_root.size
      group_by_root.set(root, group)
    }
    edge_groups[index] = group
    node_groups[start] = group
    node_groups[end] = group
  }

  return {
    directions,
    magnitudes,
    edge_nodes,
    edge_groups,
    edge_weights,
    node_groups,
  }
}
