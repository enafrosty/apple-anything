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

import { VideoTexture } from './VideoTexture'

export class TextureManager {
  private gl: WebGLRenderingContext
  private textures: Map<string, VideoTexture> = new Map()

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
  }

  createVideoTexture(
    id: string,
    onMetadataLoaded?: (duration: number, width: number, height: number) => void,
    onTimeUpdate?: (time: number) => void
  ): VideoTexture {
    this.disposeTexture(id)

    const videoTex = new VideoTexture(this.gl, onMetadataLoaded, onTimeUpdate)
    this.textures.set(id, videoTex)
    return videoTex
  }

  getVideoTexture(id: string): VideoTexture | undefined {
    return this.textures.get(id)
  }

  updateAll() {
    let allUpdated = true
    this.textures.forEach((tex) => {
      const updated = tex.updateTexture()
      if (!updated) {
        allUpdated = false
      }
    })
    return allUpdated
  }

  disposeTexture(id: string) {
    const tex = this.textures.get(id)
    if (tex) {
      tex.dispose()
      this.textures.delete(id)
    }
  }

  dispose() {
    this.textures.forEach((tex) => tex.dispose())
    this.textures.clear()
  }
}
