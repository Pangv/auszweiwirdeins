import { ref } from 'vue'

export function useDragDrop(onFilesDropped: (files: FileList) => void) {
  const dragOver = ref(false)

  function onDragOver(): void {
    dragOver.value = true
  }

  function onDragLeave(): void {
    dragOver.value = false
  }

  function onDrop(e: DragEvent): void {
    dragOver.value = false
    if (!e.dataTransfer?.files.length) return
    onFilesDropped(e.dataTransfer.files)
  }

  return {
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}