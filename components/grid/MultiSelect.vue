<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  options: string[]
  modelValue: string[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Tous',
})

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const open = ref(false)
const container = ref<HTMLElement>()

const displayLabel = computed(() => {
  if (!props.modelValue.length) return props.placeholder
  if (props.modelValue.length === 1) return props.modelValue[0]
  return `${props.modelValue[0]!} +${props.modelValue.length - 1}`
})

const isActive = computed(() => props.modelValue.length > 0)

function toggle(option: string) {
  const current = [...props.modelValue]
  const idx = current.indexOf(option)
  if (idx === -1) current.push(option)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

function clear() {
  emit('update:modelValue', [])
}

function onOutsideClick(e: MouseEvent) {
  if (container.value && !container.value.contains(e.target as Node))
    open.value = false
}

onMounted(() => document.addEventListener('click', onOutsideClick))
onUnmounted(() => document.removeEventListener('click', onOutsideClick))
</script>

<template>
  <div ref="container" class="relative">
    <button
      type="button"
      class="flex items-center gap-1.5 rounded-lg border py-1.5 pl-2.5 pr-2 text-sm transition-colors"
      :class="isActive
        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8 text-[var(--color-primary)]'
        : 'border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-text)]'"
      @click.stop="open = !open"
    >
      <span class="max-w-32 truncate text-sm">{{ displayLabel }}</span>
      <button
        v-if="isActive"
        type="button"
        class="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--color-primary)]/20"
        @click.stop="clear"
      >
        <svg class="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M2 2l6 6M8 2l-6 6" />
        </svg>
      </button>
      <svg
        v-else
        class="h-3.5 w-3.5 shrink-0 transition-transform"
        :class="open ? 'rotate-180' : ''"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M2 4l4 4 4-4" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-full z-50 mt-1 min-w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
    >
      <label
        v-for="option in options"
        :key="option"
        class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-strong)]"
      >
        <input
          type="checkbox"
          class="h-3.5 w-3.5 accent-[var(--color-primary)]"
          :checked="modelValue.includes(option)"
          @change="toggle(option)"
        />
        {{ option }}
      </label>
    </div>
  </div>
</template>
