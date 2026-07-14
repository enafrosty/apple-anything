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

import { ShaderManager } from './ShaderManager'
import { TextureManager } from './TextureManager'
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from './shaders'
import { type CompositorState } from '../state/store'

export class MaskPass {
  private gl: WebGLRenderingContext
  private shaderManager: ShaderManager
  private vertexBuffer: WebGLBuffer | null = null

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.shaderManager = new ShaderManager(gl)
    this.initBuffers()
    this.initShaders()
  }

  private initBuffers() {
    const gl = this.gl
    // Full screen quad position and UV coords (interleaved: x, y, u, v)
    // 2 triangles: 4 vertices
    const vertices = new Float32Array([
      -1, -1,  0,  0,
       1, -1,  1,  0,
      -1,  1,  0,  1,
      -1,  1,  0,  1,
       1, -1,  1,  0,
       1,  1,  1,  1,
    ])

    this.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  }

  private initShaders() {
    this.shaderManager.createProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)
  }

  render(textureManager: TextureManager, state: CompositorState) {
    const gl = this.gl
    this.shaderManager.use()

    // Bind Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)

    const program = this.shaderManager.getProgram()
    if (!program) return

    const aPosition = gl.getAttribLocation(program, 'aPosition')
    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord')

    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0)

    gl.enableVertexAttribArray(aTexCoord)
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8)

    // Textures Binding
    const maskTex = textureManager.getVideoTexture('mask')
    const whiteTex = textureManager.getVideoTexture('white')
    const blackTex = textureManager.getVideoTexture('black')

    // Bind Mask to Texture Unit 0
    const hasMask = !!(maskTex && maskTex.isLoaded && maskTex.texture)
    gl.activeTexture(gl.TEXTURE0)
    if (hasMask && maskTex) {
      gl.bindTexture(gl.TEXTURE_2D, maskTex.texture)
    } else {
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
    this.shaderManager.setUniform1i('uMaskTex', 0)
    this.shaderManager.setUniform1b('uHasMask', hasMask)

    // Bind White to Texture Unit 1
    const hasWhite = !!(whiteTex && whiteTex.isLoaded && whiteTex.texture)
    gl.activeTexture(gl.TEXTURE1)
    if (hasWhite && whiteTex) {
      gl.bindTexture(gl.TEXTURE_2D, whiteTex.texture)
    } else {
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
    this.shaderManager.setUniform1i('uWhiteTex', 1)
    this.shaderManager.setUniform1b('uHasWhite', hasWhite)

    // Bind Black to Texture Unit 2
    const hasBlack = !!(blackTex && blackTex.isLoaded && blackTex.texture)
    gl.activeTexture(gl.TEXTURE2)
    if (hasBlack && blackTex) {
      gl.bindTexture(gl.TEXTURE_2D, blackTex.texture)
    } else {
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
    this.shaderManager.setUniform1i('uBlackTex', 2)
    this.shaderManager.setUniform1b('uHasBlack', hasBlack)

    // Resolution uniform (use mask dimension if available, otherwise viewport size)
    let w = gl.canvas.width
    let h = gl.canvas.height
    if (hasMask && maskTex) {
      w = maskTex.video.videoWidth
      h = maskTex.video.videoHeight
    }
    this.shaderManager.setUniform2f('uTextureSize', w, h)

    // Set Compositing Uniforms
    this.shaderManager.setUniform1f('uThreshold', state.threshold / 255)
    this.shaderManager.setUniform1f('uFeather', state.feather / 100)
    this.shaderManager.setUniform1f('uWhiteOpacity', state.whiteOpacity)
    this.shaderManager.setUniform1f('uBlackOpacity', state.blackOpacity)

    // White video UV transformations
    this.shaderManager.setUniform1f('uWhiteScale', state.scale)
    this.shaderManager.setUniform2f('uWhiteOffset', state.offsetX, state.offsetY)
    const rotationRad = (state.rotation * Math.PI) / 180
    this.shaderManager.setUniform1f('uWhiteRotation', rotationRad)
    this.shaderManager.setUniform1b('uWhiteMirror', state.mirror)
    this.shaderManager.setUniform1b('uWhiteFlip', state.flip)

    // Set effects uniforms
    this.shaderManager.setUniform1f('uEdgeGlow', state.effects.edgeGlow)
    this.shaderManager.setUniform1f('uOutline', state.effects.outline)
    this.shaderManager.setUniform1f('uBlur', state.effects.blur)
    this.shaderManager.setUniform1f('uPixelation', state.effects.pixelation)
    this.shaderManager.setUniform1f('uChromaticAberration', state.effects.chromaticAberration)
    this.shaderManager.setUniform1f('uBrightness', state.effects.brightness)
    this.shaderManager.setUniform1f('uContrast', state.effects.contrast)
    this.shaderManager.setUniform1f('uSaturation', state.effects.saturation)
    this.shaderManager.setUniform1f('uHue', state.effects.hue)

    // Draw full screen quad
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  dispose() {
    this.shaderManager.dispose()
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer)
      this.vertexBuffer = null
    }
  }
}
