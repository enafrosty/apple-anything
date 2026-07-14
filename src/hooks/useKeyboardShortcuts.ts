/*
 * Video Mask Composer
 * Copyright (c) 2026 Frosty
 *
 * Author: Iyad Nouasra (Frosty)
 * Email: iyad@heyfrosty.space
 * GitHub: https://github.com/enafrosty
 *
 * Licensed under the MIT License.
 */

import { useEffect, useCallback } from 'react'
import { useStore } from '../state/store'

/**
 * Hook for handling keyboard shortcuts.
 * Space -> Play/Pause
 * Arrow Left/Right -> Seek ±1s
 * Ctrl+E -> Export
 * Delete -> Remove selected video
 */
export function useKeyboardShortcuts(
  onSeek: (time: number) => void,
  onExport: () => void
) {
  const store = useStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.code) {
        case 'Space': {
          e.preventDefault()
          store.setPlaying(!store.isPlaying)
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          const newTime = Math.max(0, store.globalTime - 1)
          store.setGlobalTime(newTime)
          onSeek(newTime)
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          const newTime = Math.min(store.globalDuration, store.globalTime + 1)
          store.setGlobalTime(newTime)
          onSeek(newTime)
          break
        }
        case 'KeyE': {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onExport()
          }
          break
        }
        case 'Delete': {
          e.preventDefault()
          const selected = store.selectedTrack
          if (selected) {
            store.setVideo(selected, null, null)
            store.setSelectedTrack(null)
          }
          break
        }
      }
    },
    [store, onSeek, onExport]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
