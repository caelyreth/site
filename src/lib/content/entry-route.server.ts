import { error } from '@sveltejs/kit'

import { is_entry_collection, type EntryCollection } from './entries'

export function entry_collection_param(value: string): EntryCollection {
  if (is_entry_collection(value)) return value
  throw error(404, '未找到内容集')
}
