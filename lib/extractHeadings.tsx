import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

export interface TocEntry {
  id: string
  text: string
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children)
  return ''
}

/**
 * Walks a guide's JSX body, injects a stable `id` onto every <h2>, and
 * returns both the ID-tagged content and the resulting table of contents —
 * so a jump-nav can exist for all guides without hand-editing each one's
 * content definition.
 */
export function withHeadingIds(node: ReactNode): { content: ReactNode; toc: TocEntry[] } {
  const toc: TocEntry[] = []
  const seen = new Map<string, number>()

  function uniqueId(base: string): string {
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }

  function walk(child: ReactNode): ReactNode {
    if (Array.isArray(child)) return Children.map(child, walk)
    if (!isValidElement<{ children?: ReactNode }>(child)) return child

    if (child.type === 'h2') {
      const text = extractText(child.props.children)
      const id = uniqueId(slugify(text) || `section-${toc.length + 1}`)
      toc.push({ id, text })
      return cloneElement(child, { id } as Partial<unknown>)
    }

    if (child.props?.children) {
      return cloneElement(child, { children: walk(child.props.children) } as Partial<unknown>)
    }
    return child
  }

  const content = walk(node)
  return { content, toc }
}
