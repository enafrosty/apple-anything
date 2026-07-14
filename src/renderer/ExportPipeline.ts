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

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { type CompositorState } from '../state/store'
import { MaskPass } from './MaskPass'
import { TextureManager } from './TextureManager'

export class ExportPipeline {
  private gl: WebGLRenderingContext | null = null
  private canvas: HTMLCanvasElement | null = null
  private ffmpeg: FFmpeg | null = null
  private isLoaded = false

  async initFFmpeg(state: CompositorState) {
    if (this.isLoaded) return

    state.setExportStatusText('Loading FFmpeg core components...')
    this.ffmpeg = new FFmpeg()

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    try {
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      this.isLoaded = true
      state.setExportStatusText('FFmpeg loaded successfully.')
    } catch (err) {
      console.error('Failed to load FFmpeg.wasm:', err)
      state.setExportStatusText('Failed to load FFmpeg.wasm. Check internet connection or cross-origin headers.')
      throw err
    }
  }

  async exportVideo(state: CompositorState) {
    if (state.isExporting) return
    state.setExporting(true)
    state.setExportProgress(0)

    try {
      await this.initFFmpeg(state)
      const ffmpeg = this.ffmpeg!

      // 1. Determine Export Resolution
      let width = 1920
      let height = 1080
      switch (state.exportQuality) {
        case '720p':
          width = 1280
          height = 720
          break
        case '1080p':
          width = 1920
          height = 1080
          break
        case '1440p':
          width = 2560
          height = 1440
          break
        case '4k':
          width = 3840
          height = 2160
          break
      }

      // 2. Create offscreen canvas and WebGL context
      this.canvas = document.createElement('canvas')
      this.canvas.width = width
      this.canvas.height = height
      this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true })
      if (!this.gl) {
        throw new Error('Failed to get offscreen WebGL context')
      }

      const gl = this.gl
      gl.viewport(0, 0, width, height)

      // Initialize renderer components offscreen
      const exportTextureManager = new TextureManager(gl)
      const exportMaskPass = new MaskPass(gl)

      // Initialize Video sources
      const maskSrc = state.maskVideo.url
      const whiteSrc = state.whiteVideo.url
      const blackSrc = state.blackVideo.url

      const maskTex = exportTextureManager.createVideoTexture('mask')
      const whiteTex = exportTextureManager.createVideoTexture('white')
      const blackTex = exportTextureManager.createVideoTexture('black')

      maskTex.setSource(maskSrc)
      whiteTex.setSource(whiteSrc)
      blackTex.setSource(blackSrc)

      state.setExportStatusText('Preparing video tracks...')

      // Helper function to wait for loaded video metadata
      const waitForMetadata = (vidTex: any) => {
        if (!vidTex.video.src) return Promise.resolve()
        if (vidTex.isLoaded) return Promise.resolve()
        return new Promise<void>((resolve) => {
          const handler = () => {
            vidTex.video.removeEventListener('loadedmetadata', handler)
            resolve()
          }
          vidTex.video.addEventListener('loadedmetadata', handler)
        })
      }

      await Promise.all([
        waitForMetadata(maskTex),
        waitForMetadata(whiteTex),
        waitForMetadata(blackTex),
      ])

      // Determine duration and FPS (default to 30 FPS for export)
      const fps = 30
      const duration = state.globalDuration || maskTex.video.duration || 5
      const totalFrames = Math.ceil(duration * fps)

      state.setExportStatusText(`Rendering ${totalFrames} frames...`)

      // Seek helpers
      const seekToTime = async (video: HTMLVideoElement, time: number) => {
        if (!video.src) return
        video.currentTime = time
        return new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked)
            resolve()
          }
          video.addEventListener('seeked', onSeeked)
        })
      }

      // Render frames
      for (let i = 0; i < totalFrames; i++) {
        const time = i / fps

        // Perform parallel seeking
        const seekPromises: Promise<any>[] = []
        if (maskTex.video.src) seekPromises.push(seekToTime(maskTex.video, time % maskTex.video.duration))
        if (whiteTex.video.src) seekPromises.push(seekToTime(whiteTex.video, time % whiteTex.video.duration))
        if (blackTex.video.src) seekPromises.push(seekToTime(blackTex.video, time % blackTex.video.duration))

        await Promise.all(seekPromises)

        // Force update WebGL textures
        exportTextureManager.updateAll()

        // Clear and draw
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        exportMaskPass.render(exportTextureManager, state)

        // Read pixels to blob
        const blob = await new Promise<Blob | null>((resolve) => {
          this.canvas!.toBlob(resolve, 'image/jpeg', 0.92)
        })

        if (!blob) {
          throw new Error(`Failed to capture frame ${i}`)
        }

        // Convert blob to array buffer and write to FFmpeg FS
        const arrayBuffer = await blob.arrayBuffer()
        const frameData = new Uint8Array(arrayBuffer)
        const frameName = `frame_${String(i).padStart(5, '0')}.jpg`
        await ffmpeg.writeFile(frameName, frameData)

        // Update progress
        const renderProgress = Math.round((i / totalFrames) * 80)
        state.setExportProgress(renderProgress)
        state.setExportStatusText(`Rendering frame ${i + 1}/${totalFrames}...`)
      }

      // 3. Compile frames using FFmpeg
      state.setExportStatusText('Encoding video frames...')
      const outputFilename = `export.${state.exportFormat}`

      // Encode command parameters
      const ffmpegArgs = [
        '-framerate',
        `${fps}`,
        '-i',
        'frame_%05d.jpg',
        '-c:v',
        state.exportFormat === 'mp4' ? 'libx264' : 'libvpx-vp9',
        '-pix_fmt',
        'yuv420p',
        outputFilename,
      ]

      await ffmpeg.exec(ffmpegArgs)
      state.setExportProgress(95)
      state.setExportStatusText('Encoding complete. Saving file...')

      // 4. Download file
      const data = await ffmpeg.readFile(outputFilename)
      const videoBlob = new Blob([data as any], { type: state.exportFormat === 'mp4' ? 'video/mp4' : 'video/webm' })

      const downloadUrl = URL.createObjectURL(videoBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `Video_Mask_Composer_Export_${Date.now()}.${state.exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      // Clean up workspace files in FFmpeg FS
      for (let i = 0; i < totalFrames; i++) {
        const frameName = `frame_${String(i).padStart(5, '0')}.jpg`
        try {
          await ffmpeg.deleteFile(frameName)
        } catch {}
      }
      try {
        await ffmpeg.deleteFile(outputFilename)
      } catch {}

      // Clean up offscreen resources
      exportTextureManager.dispose()
      exportMaskPass.dispose()

      state.setExportProgress(100)
      state.setExportStatusText('Export complete! File downloaded.')
    } catch (err: any) {
      console.error(err)
      state.setExportStatusText(`Export failed: ${err.message || err}`)
    } finally {
      state.setExporting(false)
    }
  }
}
