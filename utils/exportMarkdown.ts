import type { JSONContent } from '@tiptap/vue-3'

/**
 * 把 Tiptap JSON 转成 Markdown 字符串
 */
export function tiptapToMarkdown(doc: JSONContent): string {
  let md = ''

  /* 1. 不带索引的主遍历 */
  function walk(nodes: JSONContent[]): string {
    return nodes.map(n => process(n)).join('')
  }

  /* 2. 真正处理单个节点的函数 */
  function process(node: JSONContent): string {
    switch (node.type) {
      case 'doc':
        return walk(node.content || [])

      case 'paragraph':
        return walk(node.content || []) + '\n\n'

      case 'heading':
        const level = node.attrs?.level || 1
        return '#'.repeat(level) + ' ' + walk(node.content || []) + '\n\n'

      case 'bulletList':
        return walk(node.content || [])

      case 'orderedList':
        return (node.content || [])
          .map((item, idx) => processListItem(item, idx + 1, true))
          .join('')

      case 'listItem':
        return processListItem(node)          // 普通调用，无序号

      case 'codeBlock':
        const lang = node.attrs?.language || ''
        const code = (node.content || []).map(c => c.text || '').join('')
        return '```' + lang + '\n' + code + '\n```\n\n'

      case 'blockquote':
        const quote = walk(node.content || []).trim()
        return quote
          .split('\n')
          .map(l => '> ' + l)
          .join('\n') + '\n\n'

      case 'horizontalRule':
        return '\n---\n\n'

      case 'image':
        const src = node.attrs?.src || ''
        const alt = node.attrs?.alt || ''
        return `![${alt}](${src})\n\n`

      case 'text':
        let txt = node.text || ''
        if (node.marks) {
          node.marks.forEach(mark => {
            switch (mark.type) {
              case 'bold':
                txt = `**${txt}**`
                break
              case 'italic':
                txt = `*${txt}*`
                break
              case 'code':
                txt = `\`${txt}\``
                break
              case 'strike':
                txt = `~~${txt}~~`
                break
            }
          })
        }
        return txt

      default:
        return walk(node.content || [])
    }
  }

  /* 3. 专门处理 listItem 的辅助函数，可带序号 */
  function processListItem(
    node: JSONContent,
    index?: number,
    ordered = false
  ): string {
    const prefix = ordered ? `${index}. ` : '- '
    return prefix + walk(node.content || []).trim() + '\n'
  }

  return walk([doc]).trim()
}

/**
 * 触发浏览器下载
 */
export function downloadMarkdown(md: string, filename = 'note') {
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.md`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}