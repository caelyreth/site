import {
  thread_frontmatter_schema,
  type EssaySummary,
  type ThreadDocument,
  type ThreadSummary,
} from './archive'
import { load_essay_summaries } from './essays.server'
import { parse_frontmatter, parse_markdown } from './markdown.server'

const thread_sources = import.meta.glob<string>(
  '../../../content/threads/*.md',
  {
    import: 'default',
    query: '?raw',
  },
)
const source_prefix = '../../../content/threads/'

interface ThreadRecord {
  document: ThreadDocument
  id: string
}

interface ThreadIndex {
  essays: EssaySummary[]
  records: ThreadRecord[]
  threads: ThreadSummary[]
}

function source_for(id: string) {
  const source_path = `${source_prefix}${id}.md`
  const source = thread_sources[source_path]
  if (!source) throw new Error(`Unknown thread "${id}".`)
  return { source, source_path }
}

function latest_date(thread: ThreadSummary) {
  return thread.latest[0]?.published ?? ''
}

function compare_threads(left: ThreadSummary, right: ThreadSummary) {
  const date_order = latest_date(right).localeCompare(latest_date(left))
  if (date_order) return date_order
  return left.id.localeCompare(right.id)
}

function sort_threads(entries: ThreadSummary[]) {
  return entries.sort(compare_threads)
}

function add_essay_to_thread(
  essays_by_thread: Map<string, EssaySummary[]>,
  id: string,
  essay: EssaySummary,
) {
  const entries = essays_by_thread.get(id) ?? []
  entries.push(essay)
  essays_by_thread.set(id, entries)
}

function collect_thread_entries(
  essays: EssaySummary[],
  known_threads: Map<string, ThreadRecord>,
) {
  const essays_by_thread = new Map<string, EssaySummary[]>()

  for (const essay of essays) {
    for (const id of essay.threads) {
      if (!known_threads.has(id)) {
        throw new Error(
          `content/essays/${essay.slug}.md: unknown thread "${id}".`,
        )
      }
      add_essay_to_thread(essays_by_thread, id, essay)
    }
  }

  return essays_by_thread
}

export function thread_ids() {
  return Object.keys(thread_sources)
    .map((source) => source.slice(source_prefix.length, -'.md'.length))
    .sort()
}

export async function load_thread(id: string): Promise<ThreadDocument> {
  const { source, source_path } = source_for(id)
  const document = await parse_markdown(await source())

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      thread_frontmatter_schema,
    ),
  }
}

async function load_thread_records() {
  return Promise.all(
    thread_ids().map(async (id) => ({
      document: await load_thread(id),
      id,
    })),
  )
}

function build_thread_index(
  records: ThreadRecord[],
  essays: EssaySummary[],
) {
  const known_threads = new Map(
    records.map((record) => [record.id, record]),
  )
  const essays_by_thread = collect_thread_entries(essays, known_threads)

  return sort_threads(
    records.flatMap(({ document, id }) => {
      const entries = essays_by_thread.get(id) ?? []
      if (entries.length === 0) return []
      return [
        {
          entry_count: entries.length,
          id,
          latest: entries.slice(0, 3),
          summary: document.frontmatter.summary,
          title: document.frontmatter.title,
        },
      ]
    }),
  )
}

export async function load_thread_summaries() {
  return (await load_thread_index()).threads
}

async function load_thread_index(): Promise<ThreadIndex> {
  const [records, essays] = await Promise.all([
    load_thread_records(),
    load_essay_summaries(),
  ])
  return {
    essays,
    records,
    threads: build_thread_index(records, essays),
  }
}

export async function load_thread_entries(id: string) {
  const index = await load_thread_index()
  const thread = index.threads.find((entry) => entry.id === id)
  const record = index.records.find((entry) => entry.id === id)
  if (!thread || !record) return undefined

  return {
    document: record.document,
    entries: index.essays.filter((essay) => essay.threads.includes(id)),
    thread,
  }
}
