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

import { TextureManager } from './TextureManager'
import { MaskPass } from './MaskPass'
import { FrameClock } from './FrameClock'
import { RenderLoop } from './RenderLoop'
import { type CompositorState } from '../state/store'

export class Renderer {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  textureManager: TextureManager
  maskPass: MaskPass
  frameClock: FrameClock
  renderLoop: RenderLoop

  private activeState: CompositorState | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    const gl = canvas.getContext('webgl', {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })

    if (!gl) {
      throw new Error('WebGL context creation failed.')
    }
    this.gl = gl

    this.textureManager = new TextureManager(gl)
    this.maskPass = new MaskPass(gl)
    this.frameClock = new FrameClock()
    this.renderLoop = new RenderLoop(this.render)
  }

  init(state: CompositorState) {
    this.activeState = state

    // Initialize Video textures
    this.textureManager.createVideoTexture(
      'mask',
      (duration, w, h) => state.updateVideoMetadata('mask', duration, w, h),
      (time) => state.updateVideoTime('mask', time)
    )

    this.textureManager.createVideoTexture(
      'white',
      (duration, w, h) => state.updateVideoMetadata('white', duration, w, h),
      (time) => state.updateVideoTime('white', time)
    )

    this.textureManager.createVideoTexture(
      'black',
      (duration, w, h) => state.updateVideoMetadata('black', duration, w, h),
      (time) => state.updateVideoTime('black', time)
    )

    this.resize()
    this.renderLoop.start()
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    const targetWidth = Math.floor(width * dpr)
    const targetHeight = Math.floor(height * dpr)

    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
      this.canvas.width = targetWidth
      this.canvas.height = targetHeight
      this.gl.viewport(0, 0, targetWidth, targetHeight)
    }
  }

  updateSources(state: CompositorState) {
    this.activeState = state
    const mask = this.textureManager.getVideoTexture('mask')
    const white = this.textureManager.getVideoTexture('white')
    const black = this.textureManager.getVideoTexture('black')

    if (mask && mask.video.src !== (state.maskVideo.url || '')) {
      mask.setSource(state.maskVideo.url)
    }
    if (white && white.video.src !== (state.whiteVideo.url || '')) {
      white.setSource(state.whiteVideo.url)
    }
    if (black && black.video.src !== (state.blackVideo.url || '')) {
      black.setSource(state.blackVideo.url)
    }
  }

  updatePlayback(state: CompositorState) {
    this.activeState = state
    const textures = ['mask', 'white', 'black']

    textures.forEach((id) => {
      const tex = this.textureManager.getVideoTexture(id)
      if (!tex || !tex.isLoaded) return

      // Handle play / pause
      if (state.isPlaying) {
        tex.play()
      } else {
        tex.pause()
      }

      // Sync settings
      tex.setSpeed(state.playbackSpeed)
      tex.setMute(state.isMuted)
      tex.setLoop(state.isLooping)
    })
  }

  seek(time: number) {
    const textures = ['mask', 'white', 'black']
    textures.forEach((id) => {
      const tex = this.textureManager.getVideoTexture(id)
      if (tex && tex.isLoaded) {
        // Wrap seek time if it exceeds video duration
        const duration = tex.video.duration
        if (duration > 0) {
          tex.seek(time % duration)
        }
      }
    })
  }

  private render = () => {
    if (!this.activeState) return

    const gl = this.gl
    const state = this.activeState

    // Update all active textures from video elements
    this.textureManager.updateAll()

    // Clear WebGL viewport
    gl.clearColor(0.05, 0.06, 0.08, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Render mask pass
    this.maskPass.render(this.textureManager, state)

    // Update FPS and Frame counter
    const clockInfo = this.frameClock.tick()
    state.setFps(clockInfo.fps)
    state.setFrameNumber(clockInfo.frame)
  }

  dispose() {
    this.renderLoop.stop()
    this.textureManager.dispose()
    this.maskPass.dispose()
  }
}
