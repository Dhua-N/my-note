<template>
  <!-- 整体骨架 -->
  <div class="flex h-full">

    <!-- 目录侧边栏 -->
    <aside
      class="w-48 border-r border-gray-200/80 dark:border-gray-700/60
             backdrop-blur-sm
             px-5 py-6 space-y-3 text-sm
             overflow-y-auto"
    >
      <h3 class="text-xl font-semibold tracking-wider uppercase text-gray-800 dark:text-gray-300">
        目录
      </h3>

      <ul class="space-y-0.5">
        <li
          v-for="h in headings"
          :key="h.id"
          :style="{ paddingLeft: (h.level - 1) * 0.75 + 'rem' }"
          class="text-sm text-gray-700 dark:text-gray-400
                 rounded transition-colors cursor-pointer
                 hover:text-blue-600 dark:hover:text-blue-400
                 py-1"
          @click="scrollToHeading(h.id)"
        >
          {{ h.text }}
        </li>
      </ul>
    </aside>

    <!-- 主编辑区 -->
    <main class="flex flex-col flex-1">
    <!-- 工具栏 -->
        <div
            class="flex flex-wrap items-center gap-1.5
                    border-b border-gray-200/80 dark:border-gray-700/60
                    bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm
                    px-4 py-2 text-sm
                    h-12 shrink-0
                    text-gray-900 dark:text-gray-100"
        >
            <!-- 标题 H1-H3 -->
            <template v-for="lvl in [1,2,3] as const" :key="lvl">
                <button
                @click="editor?.chain().focus().toggleHeading({ level: lvl}).run()"
                :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('heading', { level: lvl }) }"
                class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                :title="`标题 ${lvl}`"
                >
                H{{ lvl }}
                </button>
            </template>


            <span class="w-px h-5 bg-gray-300 dark:bg-gray-600"></span>

            <!-- 文字格式 -->
            <button
            @click="editor?.chain().focus().toggleBold().run()"
            :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('bold') }"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="加粗"
            >
            <span class="font-bold">B</span>
            </button>

            <button
            @click="editor?.chain().focus().toggleItalic().run()"
            :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('italic') }"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="斜体"
            >
            <span class="italic">I</span>
            </button>

            <button
            @click="editor?.chain().focus().toggleStrike().run()"
            :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('strike') }"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="删除线"
            >
            <span class="line-through">S</span>
            </button>

            <span class="w-px h-5 bg-gray-300 dark:bg-gray-600"></span>

            <!-- 行内代码 / 代码块 -->
            <button
                @click="editor?.chain().focus().toggleCode().run()"
                :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('code') }"
                class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="行内代码"
            >
                &lt;/&gt;
            </button>

            <button
                @click="editor?.chain().focus().toggleCodeBlock().run()"
                :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('codeBlock') }"
                class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="代码块"
            >
                【{ }】
            </button>

            <span class="w-px h-5 bg-gray-300 dark:bg-gray-600"></span>

            <!-- 列表 -->
            <button
            @click="editor?.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('bulletList') }"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="无序列表"
            >
            ••
            </button>

            <button
            @click="editor?.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('orderedList') }"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="有序列表"
            >
            123
            </button>

            <button
            @click="editor?.chain().focus().toggleTaskList().run()"
            :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('taskList') }"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="任务列表"
            >
            ☑
            </button>

            <span class="w-px h-5 bg-gray-300 dark:bg-gray-600"></span>

            <!-- 引用 / 水平线 -->
            <button
                @click="editor?.chain().focus().toggleBlockquote().run()"
                :class="{ 'bg-blue-100 dark:bg-blue-800': editor?.isActive('blockquote') }"
                class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="引用"
            >
                “”
            </button>

            <button
                @click="editor?.chain().focus().setHorizontalRule().run()"
                class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="水平线"
            >
                ―
            </button>

            <span class="w-px h-5 bg-gray-300 dark:bg-gray-600"></span>

            <!-- 表格 -->
            <button
            @click="insertTable"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="插入表格"
            >
            ⊞
            </button>

            <!-- 插入图片 -->
            <button
            @click="openImageFile"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="上传图片"
            >
            🖼
            </button>
            <input
            ref="imageInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="insertImage"
            />

            <!-- 撤销 / 重做 -->
            <button
            @click="editor?.chain().focus().undo().run()"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="撤销"
            >
            ↶
            </button>
            <button
            @click="editor?.chain().focus().redo().run()"
            class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="重做"
            >
            ↷
            </button>

             <!-- 表格工具栏（光标在 table 里才出现） -->
            <div
            v-if="editor?.isActive('table')"
            class="flex flex-wrap items-center gap-1.5 mt-1 px-4 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            >
                <button
                    @click="editor?.chain().focus().addColumnBefore().run()"
                    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    左插列
                </button>
                <button
                    @click="editor?.chain().focus().addColumnAfter().run()"
                    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    右插列
                </button>
                <button
                    @click="editor?.chain().focus().deleteColumn().run()"
                    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    删除列
                </button>

                <span class="w-px h-4 bg-gray-300 dark:bg-gray-600"></span>

                <button
                    @click="editor?.chain().focus().addRowBefore().run()"
                    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    上插行
                </button>
                <button
                    @click="editor?.chain().focus().addRowAfter().run()"
                    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    下插行
                </button>
                <button
                    @click="editor?.chain().focus().deleteRow().run()"
                    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    删除行
                </button>
                <button
                    @click="editor?.chain().focus().deleteTable().run()"
                    class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="删除整个表格"
                    >
                    删除表格
                </button>
            </div>
        </div>

        <!-- 间距（不会参与 flex 伸缩） -->
        <div class="h-2 shrink-0"></div>   <!-- 8px 空隙 -->

        <!-- 编辑器 -->
        <div class="flex-1 overflow-y-auto">
            <editor-content
                :editor="editor"
                class="focus:outline-none
                    prose prose-gray dark:prose-invert prose-sm
                    max-w-4xl mx-auto
                    selection:bg-blue-100 dark:selection:bg-blue-900/50"
            />
        </div>

        <!-- 间距（不会参与 flex 伸缩） -->
        <div class="h-2 shrink-0"></div>   <!-- 8px 空隙 -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Link } from '@tiptap/extension-link'
import { createLowlight, common } from 'lowlight'
import { Extension, InputRule, findParentNode } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image'
import { nanoid } from 'nanoid'

// 读取父级数据
const currentBody = inject<Ref<string>>('currentBody')!
const updateCurrentBody = inject<(html: string) => void>('updateCurrentBody')!

/* 🚀 1. 目录：收集 heading，实现目录及快速定位 */
const headings = ref<{ level: number; text: string; id: string }[]>([])

/* 自定义heading */
const HeadingWithId = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: { default: null, parseHTML: el => el.getAttribute('id'), renderHTML: a => a.id ? { id: a.id } : {} }
    }
  }
})

async function syncHeadingsAndIds() {
  if (!editor.value) return

  const tr = editor.value.state.tr
  const temp: typeof headings.value = []

  editor.value.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const id = node.attrs.id || `h-${nanoid(6)}`
      temp.push({ level: node.attrs.level, text: node.textContent, id })

      if (!node.attrs.id) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, id })
      }
    }
  })

  /* 判断是否有改动 */
  if (tr.docChanged) {
    editor.value.view.dispatch(tr) // 写入id
  }

  /* 更新目录（无论是否改动都刷新） */
  headings.value = temp
}
function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/* 🚀 2. 语言高亮：注册所有 common 语言 */
const lowlight = createLowlight(common)

/* 🚀 3. 图片插入 */
const imageInput = ref<HTMLInputElement>()
function openImageFile() {
  imageInput.value?.click()
}
function insertImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const reader = new FileReader()
  reader.onload = () =>
    editor.value?.chain().focus().setImage({ src: reader.result as string }).run()
  reader.readAsDataURL(file)
}

/* 🚀 4. 表格插入 */
function insertTable() {
  editor.value
    ?.chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run()
}

/* 🚀 5. 自定义快捷输入 */
/* 任务列表 */
const TaskInputRule = Extension.create({
  name: 'taskInputRule',
  addInputRules() {
    const makeRule = (regex: RegExp, checked: boolean) =>
      new InputRule({
        find: regex,
        handler: ({ state, range, chain }) => {
          const sel = state.selection
          const inList = !!findParentNode(node => node.type.name === 'taskList')(sel)

          chain()
            .deleteRange(range)
            .insertContentAt(
              range.from,
              inList
                ? { type: 'taskItem', attrs: { checked }, content: [{ type: 'paragraph' }] }
                : {
                    type: 'taskList',
                    content: [
                      { type: 'taskItem', attrs: { checked }, content: [{ type: 'paragraph' }] }
                    ]
                  }
            )
            .run()
        }
      })

    return [
      makeRule(/(-\[\]|(-\s\[\]))\s$/, false),
      makeRule(/(-\[x\]|(-\s\[x\]))\s$/i, true)
    ]
  }
})

/* tab缩进 */
const TabIndent = Extension.create({
  name: 'tabIndent',

  addKeyboardShortcuts() {
    const insertSpaces = (count = 4) =>
      this.editor.commands.insertContent(' '.repeat(count))

    const removeSpaces = (count = 4) => {
      const { state, view } = this.editor
      const { $from } = state.selection
      const pos = $from.pos
      const textBefore = state.doc.textBetween(Math.max(pos - count, 0), pos)
      if (textBefore === ' '.repeat(count)) {
        return this.editor.commands.deleteRange({
          from: pos - count,
          to: pos,
        })
      }
      return false
    }

    return {
      Tab: () => {
        insertSpaces(4)
        return true // 阻止浏览器默认
      },
      'Shift-Tab': () => {
        removeSpaces(4)
        return true
      },
    }
  },
})

/* 🚀 6. 创建编辑器 */
const editor = ref<Editor>()

editor.value = new Editor({
  extensions: [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      bulletList: { HTMLAttributes: { class: 'list-disc' } },
      orderedList: { HTMLAttributes: { class: 'list-decimal' } },
      link: false,
    }),
    HeadingWithId.configure({ levels: [1, 2, 3] }), 
    Highlight,
    CodeBlockLowlight.configure({ lowlight }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TaskInputRule,
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https'
    }),
    Image.configure({ inline: true, allowBase64: true }),
    ImageResize.configure({
        inline: true,
        allowBase64: true,
    }), 
    TabIndent, 
  ],
  autofocus: true,
  content: currentBody.value ? JSON.parse(currentBody.value) : {},
  onUpdate: ({ editor }) => {
    // 手动把光标所在行滚到中间
    const { view } = editor
    const { from } = view.state.selection
    const node = view.domAtPos(from).node as HTMLElement
    node?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })

    updateCurrentBody(JSON.stringify(editor.getJSON()))
    nextTick(syncHeadingsAndIds)
  },
  onCreate: ({ editor }) => {
    nextTick(syncHeadingsAndIds)
  },
  editorProps: {
    handleDrop(view, event, slice, moved) {
      if (!moved) {
        const files = Array.from(event.dataTransfer?.files ?? [])
        files.forEach((file) => {
          if (!file.type.startsWith('image/')) return
          const reader = new FileReader()
          reader.onload = () =>
            editor.value?.chain().focus().setImage({ src: reader.result as string }).run()
          reader.readAsDataURL(file)
        })
        return true
      }
      return false
    },
    handlePaste(view, event) {
      const files = Array.from(event.clipboardData?.files ?? [])
      files.forEach((file) => {
        if (!file.type.startsWith('image/')) return
        const reader = new FileReader()
        reader.onload = () =>
          editor.value?.chain().focus().setImage({ src: reader.result as string }).run()
        reader.readAsDataURL(file)
      })
    },
    attributes: { class: 'focus:outline-none' }
  }
})

/* 🚀 7. 检测笔记变化 */
watch(
  () => currentBody.value,
    (val) => {
        if (!editor.value) return
        try {
            const json = val ? JSON.parse(val) : {}
            if (JSON.stringify(json) !== JSON.stringify(editor.value.getJSON())) {
                editor.value.commands.setContent(json, { emitUpdate: false })
                nextTick(syncHeadingsAndIds)
            }
            else 
            emptyCheckFocus()
        } catch {}
  },
  { immediate: true }
)

function emptyCheckFocus() {
    // 空文档（仅 1 个空段落）→ 自动聚焦
    if (!editor.value) return
    const doc = editor.value.state.doc
    const isEmpty =
      doc.childCount === 1 &&
      doc.firstChild?.type.name === 'paragraph' &&
      doc.firstChild.content.size === 0

    if (isEmpty) {
      editor.value.commands.focus('end')
    }
}
</script>

<style>
/* 让 table 在 prose 主题下不溢出 */
.ProseMirror table {
  min-width: 100%;
}
.ProseMirror .tableWrapper {
  overflow-x: auto;
}
/* 任务列表样式 */
ul[data-type='taskList'] {
  list-style: none;
  padding-left: 0;
}
ul[data-type='taskList'] li {
  display: flex;
  align-items: center;
}
ul[data-type='taskList'] li > label {
  margin-right: 0.5rem;
}

/* 表格整体边框 + 单元格边框 */
.ProseMirror table {
  border-collapse: collapse;
  width: 100%;
}
.ProseMirror th,
.ProseMirror td {
  border: 1px solid #d1d5db;            /* 浅色边框 */
  padding: 0.5rem 0.75rem;
}
.dark .ProseMirror th,
.dark .ProseMirror td {
  border-color: #4b5563;                /* 深色边框 */
}

/* 表头高亮 */
.ProseMirror th {
  background-color: #f3f4f6;
}
.dark .ProseMirror th {
  background-color: #374151;
}

/* 斑马纹行，偶数行淡灰 */
.ProseMirror tr:nth-child(even) td {
  background-color: #f9fafb;
}
.dark .ProseMirror tr:nth-child(even) td {
  background-color: #2d3748;
}
</style>