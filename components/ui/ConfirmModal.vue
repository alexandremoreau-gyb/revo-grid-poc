<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useConfirmModal } from '~/composables/useConfirmModal'

const { visible, _resolve } = useConfirmModal()

function onConfirm() { _resolve(true) }
function onCancel() { _resolve(false) }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') onCancel()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="onCancel"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" />

        <!-- Dialog -->
        <div class="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
          <p class="text-sm font-medium text-[var(--color-text)]">
            Confirmer la modification ?
          </p>

          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
              @click="onCancel"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-[var(--color-primary,#1A1A2E)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              @click="onConfirm"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
