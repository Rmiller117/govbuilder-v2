<template>
  <div class="code-editor-container">
    <div ref="editorRef" class="editor-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { EditorView, keymap, Decoration, ViewPlugin, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { defaultKeymap, insertTab, selectAll, undo, redo, toggleComment } from '@codemirror/commands'
import { autocompletion } from '@codemirror/autocomplete'
import { searchKeymap } from '@codemirror/search'
import { HighlightStyle, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  protectTemplate?: boolean
  templateStart?: string
  templateEnd?: string
  showLineNumbers?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': []
  'blur': []
}>()

const editorRef = ref<HTMLElement>()
let view: EditorView | null = null

// Check if we're in dark mode
const isDarkMode = () => {
  return document.documentElement.classList.contains('dark')
}

// Custom theme that matches your app's design
const customTheme = EditorView.theme({
  '&': {
    color: 'rgb(var(--text, 24292f))',
    backgroundColor: 'rgb(var(--surface, 255 255 255))',
    fontSize: '16px',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  '.cm-content': {
    padding: '20px 24px',
    minHeight: '240px',
    caretColor: 'rgb(var(--text, 24292f))',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-editor': {
    borderRadius: '12px',
    border: '2px solid rgb(var(--border, 226 232 240))',
    backgroundColor: 'rgb(var(--surface, 250 250 250))',
    minHeight: '240px',
  },
  '.cm-editor.cm-focused': {
    borderColor: 'rgb(var(--ring, 59 130 246))',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '.cm-scroller': {
    minHeight: '240px',
    overflow: 'auto',
  },
  '.cm-line': {
    padding: '2px 0',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  '.cm-placeholder': {
    color: 'rgb(var(--text-muted, 100 116 139))',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  // HTML syntax highlighting colors for light mode
  '.cm-property': { color: '#0969da' },
  '.cm-attribute': { color: '#cf222e' },
  '.cm-tag': { color: '#116329' },
  '.cm-string': { color: '#0a3069' },
  '.cm-keyword': { color: '#8250df' },
  // Liquid variables
  '.cm-liquid-variable': { 
    color: '#0969da',
    fontWeight: '500'
  },
  '.cm-liquid-tag': { 
    color: '#8250df',
    fontWeight: '500'
  },
  '.cm-liquid-punctuation': {
    color: '#656d76'
  }
})

// Dark theme overrides
const darkTheme = EditorView.theme({
  '&': {
    color: 'rgb(var(--text, 203 213 224))',
    backgroundColor: 'rgb(var(--surface, 30 41 59))',
  },
  '.cm-content': {
    backgroundColor: 'rgb(var(--surface, 30 41 59))',
    color: 'rgb(var(--text, 203 213 224))',
    caretColor: 'rgb(var(--text, 203 213 224))',
  },
  '.cm-editor': {
    borderColor: 'rgb(var(--border, 51 65 85))',
    backgroundColor: 'rgb(var(--surface, 30 41 59))',
    minHeight: '240px',
  },
  '.cm-editor.cm-focused': {
    borderColor: 'rgb(var(--ring, 96 165 250))',
    boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.2)',
  },
  '.cm-scroller': {
    backgroundColor: 'rgb(var(--surface, 30 41 59))',
  },
  '.cm-placeholder': {
    color: 'rgb(var(--text-muted, 148 163 184))',
  },
  '.cm-property': { color: '#58a6ff' },
  '.cm-attribute': { color: '#ff7b72' },
  '.cm-tag': { color: '#7ee787' },
  '.cm-string': { color: '#a5d6ff' },
  '.cm-keyword': { color: '#d2a8ff' },
  '.cm-liquid-variable': { 
    color: '#58a6ff',
    fontWeight: '500'
  },
  '.cm-liquid-tag': { 
    color: '#d2a8ff',
    fontWeight: '500'
  },
  '.cm-liquid-punctuation': {
    color: '#8b949e'
  }
}, { dark: true })

// Custom Liquid syntax highlighting style
const liquidHighlightStyle = HighlightStyle.define([
  { tag: tags.variableName, class: 'cm-liquid-variable' },
  { tag: tags.keyword, class: 'cm-liquid-tag' },
  { tag: tags.punctuation, class: 'cm-liquid-punctuation' },
])

// Custom Liquid syntax highlighter
const liquidHighlighter = EditorView.theme({
  '.cm-liquid-variable': { 
    color: '#0969da',
    fontWeight: '500'
  },
  '.cm-liquid-tag': { 
    color: '#8250df',
    fontWeight: '500'
  },
  '.cm-liquid-punctuation': {
    color: '#656d76'
  }
})

// Dark theme overrides for Liquid
const liquidDarkHighlighter = EditorView.theme({
  '.cm-liquid-variable': { 
    color: '#58a6ff',
    fontWeight: '500'
  },
  '.cm-liquid-tag': { 
    color: '#d2a8ff',
    fontWeight: '500'
  },
  '.cm-liquid-punctuation': {
    color: '#8b949e'
  }
}, { dark: true })

// Custom Liquid syntax highlighter and placeholder plugin
const liquidHighlighterPlugin = ViewPlugin.fromClass(class {
  decorations: any

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view)
  }

  update(update: any) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view)
    }
  }

  buildDecorations(view: EditorView) {
    const doc = view.state.doc.toString()
    const decorations: any[] = []
    
    // Add placeholder if document is empty
    if (!doc.trim() && props.placeholder) {
      const placeholderWidget = Decoration.widget({
        side: 1,
        widget: {
          toDOM: () => {
            const span = document.createElement('span')
            span.className = 'cm-placeholder'
            span.textContent = props.placeholder || ''
            span.style.pointerEvents = 'none'
            return span
          },
          destroy: () => {},
          ignoreEvent: () => false,
          updateDOM: () => false,
          eq: () => true,
          coordsAt: () => null,
          estimatedHeight: -1,
          lineBreaks: 0
        }
      })
      decorations.push(placeholderWidget.range(0))
    }
    
    // Highlight Liquid variables {{ variable }}
    const variableRegex = /\{\{([^}]+)\}\}/g
    let match
    while ((match = variableRegex.exec(doc)) !== null) {
      const start = match.index
      const end = start + match[0].length
      decorations.push(Decoration.mark({ class: 'cm-liquid-variable' }).range(start, end))
    }
    
    // Highlight Liquid tags {% tag %}
    const tagRegex = /\{%([^%]+)%\}/g
    while ((match = tagRegex.exec(doc)) !== null) {
      const start = match.index
      const end = start + match[0].length
      decorations.push(Decoration.mark({ class: 'cm-liquid-tag' }).range(start, end))
    }
    
    return Decoration.set(decorations)
  }
}, {
  decorations: (v: any) => v.decorations
})

// Create editor extensions
function createExtensions(isDark: boolean) {
  const extensions = [
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        let newValue = update.state.doc.toString()
        
        // Template protection logic
        if (props.protectTemplate && props.templateStart && props.templateEnd) {
          const startIndex = newValue.indexOf(props.templateStart)
          const endIndex = newValue.lastIndexOf(props.templateEnd)
          
          // If template tags are being modified, restore them
          if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
            newValue = props.templateStart + props.templateEnd
          } else {
            // Ensure nothing is inserted before template start
            const beforeTemplate = newValue.substring(0, startIndex)
            if (beforeTemplate.trim()) {
              newValue = props.templateStart + props.templateEnd + newValue.substring(endIndex + props.templateEnd.length)
            }
          }
        }
        
        emit('update:modelValue', newValue)
      }
      if (update.focusChanged) {
        if (update.view.hasFocus) {
          emit('focus')
        } else {
          emit('blur')
        }
      }
    }),
    keymap.of([
      ...defaultKeymap,
      ...searchKeymap,
      { key: 'Tab', run: insertTab },
      // Additional rich text shortcuts
      { key: 'Mod-a', run: selectAll },
      { key: 'Mod-z', run: undo },
      { key: 'Mod-y', run: redo },
      { key: 'Mod-Shift-z', run: redo },
      { key: 'Mod-/', run: toggleComment },
    ]),
    html(),
    autocompletion(),
    syntaxHighlighting(liquidHighlightStyle),
    syntaxHighlighting(defaultHighlightStyle),
    customTheme,
    isDark ? darkTheme : [],
    liquidHighlighter,
    isDark ? liquidDarkHighlighter : [],
    liquidHighlighterPlugin,
    EditorState.tabSize.of(2),
    EditorView.lineWrapping,
    // Rich text features
    EditorState.allowMultipleSelections.of(true),
    EditorState.readOnly.of(props.disabled || false),
    // Optional line numbers
    ...(props.showLineNumbers ? [lineNumbers()] : []),
  ]

  return extensions
}

// Initialize editor
function initializeEditor() {
  if (!editorRef.value) return

  const isDark = isDarkMode()
  const state = EditorState.create({
    doc: props.modelValue || '',
    extensions: createExtensions(isDark),
  })

  view = new EditorView({
    state,
    parent: editorRef.value,
  })
}

// Watch for model changes
watch(() => props.modelValue, (newValue) => {
  if (view && view.state.doc.toString() !== newValue) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newValue
      }
    })
  }
})

// Watch for theme changes
const watchTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = () => {
    if (view) {
      const isDark = isDarkMode()
      // Reconfigure theme by recreating the editor
      const currentState = view.state
      const newState = EditorState.create({
        doc: currentState.doc.toString(),
        extensions: createExtensions(isDark),
      })
      view.setState(newState)
    }
  }

  mediaQuery.addEventListener('change', handleThemeChange)
  
  // Also watch for class changes on documentElement
  const observer = new MutationObserver(handleThemeChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  return () => {
    mediaQuery.removeEventListener('change', handleThemeChange)
    observer.disconnect()
  }
}

onMounted(() => {
  nextTick(() => {
    initializeEditor()
    const cleanup = watchTheme()
    onUnmounted(cleanup)
  })
})

onUnmounted(() => {
  if (view) {
    view.destroy()
    view = null
  }
})

// Expose editor methods
defineExpose({
  focus: () => view?.focus(),
  insertText: (text: string, position?: number) => {
    if (!view) return
    
    const pos = position ?? view.state.selection.main.head
    view.dispatch({
      changes: {
        from: pos,
        to: pos,
        insert: text
      }
    })
  },
  getCursor: () => view?.state.selection.main.head || 0,
  setCursor: (position: number) => {
    if (view) {
      view.dispatch({
        selection: { anchor: position, head: position }
      })
    }
  }
})
</script>

<style scoped>
.code-editor-container {
  width: 100%;
}

.editor-wrapper {
  width: 100%;
  min-height: 240px;
  border-radius: 12px;
  overflow: hidden;
}

/* Ensure editor has proper borders and background */
:deep(.cm-editor) {
  border: 2px solid rgb(var(--border)) !important;
  background-color: rgb(var(--surface)) !important;
  border-radius: 12px !important;
  min-height: 240px !important;
}

:deep(.cm-editor.cm-focused) {
  border-color: rgb(var(--ring)) !important;
  box-shadow: 0 0 0 2px rgba(var(--ring), 0.2) !important;
}

:deep(.cm-content) {
  background-color: rgb(var(--surface)) !important;
  color: rgb(var(--text)) !important;
  caret-color: rgb(var(--text)) !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  padding: 20px 24px !important;
  min-height: 240px !important;
}

:deep(.cm-scroller) {
  min-height: 240px !important;
  background-color: rgb(var(--surface)) !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
}

:deep(.cm-line) {
  font-size: 16px !important;
  line-height: 1.5 !important;
  padding: 2px 0 !important;
}

:deep(.cm-placeholder) {
  font-size: 16px !important;
  line-height: 1.5 !important;
  color: rgb(var(--text-muted)) !important;
}

/* Custom scrollbar for editor */
:deep(.cm-scroller) {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--border)) transparent;
}

:deep(.cm-scroller::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.cm-scroller::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb) {
  background-color: rgb(var(--border));
  border-radius: 4px;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb:hover) {
  background-color: rgb(var(--text-muted));
}

/* Dark mode overrides */
html.dark :deep(.cm-editor) {
  border-color: rgb(var(--border)) !important;
  background-color: rgb(var(--surface)) !important;
}

html.dark :deep(.cm-editor.cm-focused) {
  border-color: rgb(var(--ring)) !important;
  box-shadow: 0 0 0 2px rgba(var(--ring), 0.2) !important;
}

html.dark :deep(.cm-content) {
  background-color: rgb(var(--surface)) !important;
  color: rgb(var(--text)) !important;
  caret-color: rgb(var(--text)) !important;
}

html.dark :deep(.cm-scroller) {
  background-color: rgb(var(--surface)) !important;
}

html.dark :deep(.cm-scroller::-webkit-scrollbar-thumb) {
  background-color: rgb(var(--border));
}

html.dark :deep(.cm-scroller::-webkit-scrollbar-thumb:hover) {
  background-color: rgb(var(--text-muted));
}
</style>