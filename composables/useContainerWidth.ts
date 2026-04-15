import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * Observe la largeur d'un élément DOM via ResizeObserver.
 * Plus précis que window.innerWidth : réagit aussi au collapse/expand de sidebar.
 *
 * @param containerRef - ref vers l'élément à observer
 * @returns width - largeur courante en pixels (0 avant montage)
 */
export function useContainerWidth(containerRef: Ref<HTMLElement | null>) {
  const width = ref(0)
  let observer: ResizeObserver | null = null

  onMounted(() => {
    const el = containerRef.value
    if (!el) return

    width.value = el.getBoundingClientRect().width

    observer = new ResizeObserver(([entry]) => {
      if (entry) width.value = entry.contentRect.width
    })
    observer.observe(el)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { width }
}
