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

import { useEffect, useRef, useCallback } from 'react'
import { Renderer } from '../renderer/Renderer'
import { ExportPipeline } from '../renderer/ExportPipeline'
import { useStore } from '../state/store'

/**
 * Hook that initialises the WebGL Renderer, keeps it synchronised with
 * the Zustand store, and exposes seek / export helpers.
 */
export function useRenderer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rendererRef = useRef<Renderer | null>(null)
  const exportPipelineRef = useRef<ExportPipeline | null>(null)
  const store = useStore()

  // ---------- initialise / destroy ----------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const renderer = new Renderer(canvas)
      renderer.init(store)
      rendererRef.current = renderer
      exportPipelineRef.current = new ExportPipeline()
    } catch (err) {
      console.error('Failed to initialise WebGL renderer:', err)
    }

    const handleResize = () => rendererRef.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  // ---------- sync video sources ----------
  useEffect(() => {
    rendererRef.current?.updateSources(store)
  }, [store.maskVideo.url, store.whiteVideo.url, store.blackVideo.url])

  // ---------- sync playback state ----------
  useEffect(() => {
    rendererRef.current?.updatePlayback(store)
  }, [store.isPlaying, store.playbackSpeed, store.isMuted, store.isLooping])

  // ---------- keep active state pointer ----------
  useEffect(() => {
    if (rendererRef.current) {
      (rendererRef.current as any).activeState = store
    }
  })

  // ---------- helpers ----------
  const seek = useCallback(
    (time: number) => {
      rendererRef.current?.seek(time)
    },
    []
  )

  const startExport = useCallback(async () => {
    const renderer = rendererRef.current
    const pipeline = exportPipelineRef.current
    if (!renderer || !pipeline) return

    await pipeline.exportVideo(store)
  }, [store])

  return { seek, startExport, rendererRef }
}
