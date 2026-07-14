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

export class VideoTexture {
  video: HTMLVideoElement
  texture: WebGLTexture | null = null
  isLoaded = false
  private gl: WebGLRenderingContext
  private onMetadataLoaded?: (duration: number, width: number, height: number) => void
  private onTimeUpdate?: (time: number) => void

  constructor(
    gl: WebGLRenderingContext,
    onMetadataLoaded?: (duration: number, width: number, height: number) => void,
    onTimeUpdate?: (time: number) => void
  ) {
    this.gl = gl
    this.onMetadataLoaded = onMetadataLoaded
    this.onTimeUpdate = onTimeUpdate

    this.video = document.createElement('video')
    this.video.autoplay = false
    this.video.loop = true
    this.video.muted = true
    this.video.playsInline = true
    this.video.crossOrigin = 'anonymous'

    // Disable audio context issues by muting by default
    this.video.setAttribute('muted', '')
    this.video.setAttribute('playsinline', '')

    this.video.addEventListener('loadedmetadata', this.handleLoadedMetadata)
    this.video.addEventListener('timeupdate', this.handleTimeUpdate)
  }

  private handleLoadedMetadata = () => {
    this.isLoaded = true
    // Initialize WebGL Texture
    this.initTexture()

    if (this.onMetadataLoaded) {
      this.onMetadataLoaded(
        this.video.duration,
        this.video.videoWidth,
        this.video.videoHeight
      )
    }
  }

  private handleTimeUpdate = () => {
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.video.currentTime)
    }
  }

  private initTexture() {
    const gl = this.gl
    if (this.texture) {
      gl.deleteTexture(this.texture)
    }

    this.texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    // Set filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // Upload placeholder pixel
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    )
  }

  setSource(url: string | null) {
    this.isLoaded = false
    this.video.pause()

    if (url) {
      this.video.src = url
      this.video.load()
    } else {
      this.video.src = ''
      if (this.texture) {
        this.gl.deleteTexture(this.texture)
        this.texture = null
      }
    }
  }

  play() {
    if (this.video.src) {
      this.video.play().catch((err) => {
        console.warn('Video failed to play: ', err)
      })
    }
  }

  pause() {
    this.video.pause()
  }

  seek(time: number) {
    if (this.video.readyState >= 1) {
      this.video.currentTime = time
    }
  }

  setSpeed(speed: number) {
    this.video.playbackRate = speed
  }

  setMute(mute: boolean) {
    this.video.muted = mute
  }

  setLoop(loop: boolean) {
    this.video.loop = loop
  }

  updateTexture() {
    const gl = this.gl
    if (!this.texture || !this.isLoaded || this.video.readyState < this.video.HAVE_CURRENT_DATA) {
      return false
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    // Upload frame to GPU texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video)
    return true
  }

  dispose() {
    this.video.removeEventListener('loadedmetadata', this.handleLoadedMetadata)
    this.video.removeEventListener('timeupdate', this.handleTimeUpdate)
    this.video.pause()
    this.video.src = ''
    this.video.load()

    if (this.texture) {
      this.gl.deleteTexture(this.texture)
      this.texture = null
    }
  }
}
