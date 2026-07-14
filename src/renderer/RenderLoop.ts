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

export class RenderLoop {
  private rafId: number | null = null
  private callback: () => void
  private isRunning = false

  constructor(callback: () => void) {
    this.callback = callback
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.tick()
  }

  stop() {
    this.isRunning = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private tick = () => {
    if (!this.isRunning) return
    this.callback()
    this.rafId = requestAnimationFrame(this.tick)
  }
}
