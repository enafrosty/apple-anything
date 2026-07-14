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

export class FrameClock {
  private lastTime = 0
  private frameCount = 0
  private fpsInterval = 1000 // update FPS once per second
  private lastFpsUpdate = 0
  private currentFps = 0
  private currentFrame = 0

  constructor() {
    this.reset()
  }

  reset() {
    this.lastTime = performance.now()
    this.lastFpsUpdate = this.lastTime
    this.frameCount = 0
    this.currentFps = 0
    this.currentFrame = 0
  }

  tick(): { fps: number; frame: number } {
    const now = performance.now()
    this.frameCount++
    this.currentFrame++

    const elapsed = now - this.lastFpsUpdate
    if (elapsed >= this.fpsInterval) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed)
      this.frameCount = 0
      this.lastFpsUpdate = now
    }

    this.lastTime = now
    return {
      fps: this.currentFps,
      frame: this.currentFrame,
    }
  }

  getFps() {
    return this.currentFps
  }

  getFrameNumber() {
    return this.currentFrame
  }
}
