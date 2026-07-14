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

export class ShaderManager {
  private gl: WebGLRenderingContext
  private program: WebGLProgram | null = null
  private uniforms: { [name: string]: WebGLUniformLocation } = {}

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
  }

  createProgram(vsSource: string, fsSource: string): WebGLProgram {
    const gl = this.gl
    if (this.program) {
      gl.deleteProgram(this.program)
      this.program = null
      this.uniforms = {}
    }

    const vs = this.compileShader(vsSource, gl.VERTEX_SHADER)
    const fs = this.compileShader(fsSource, gl.FRAGMENT_SHADER)

    const program = gl.createProgram()
    if (!program) {
      throw new Error('Failed to create WebGL program')
    }

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program)
      gl.deleteProgram(program)
      throw new Error(`Failed to link shader program: ${log}`)
    }

    // Clean up individual shaders after linking
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    this.program = program
    this.cacheUniformLocations()

    return program
  }

  private compileShader(source: string, type: number): WebGLShader {
    const gl = this.gl
    const shader = gl.createShader(type)
    if (!shader) {
      throw new Error('Failed to create WebGL shader')
    }

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(`Shader compilation failed: ${log}`)
    }

    return shader
  }

  private cacheUniformLocations() {
    const gl = this.gl
    const program = this.program
    if (!program) return

    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i)
      if (info) {
        const loc = gl.getUniformLocation(program, info.name)
        if (loc !== null) {
          this.uniforms[info.name] = loc
        }
      }
    }
  }

  use() {
    if (this.program) {
      this.gl.useProgram(this.program)
    }
  }

  getProgram(): WebGLProgram | null {
    return this.program
  }

  setUniform1f(name: string, val: number) {
    const loc = this.uniforms[name]
    if (loc !== undefined) {
      this.gl.uniform1f(loc, val)
    }
  }

  setUniform1i(name: string, val: number) {
    const loc = this.uniforms[name]
    if (loc !== undefined) {
      this.gl.uniform1i(loc, val)
    }
  }

  setUniform2f(name: string, x: number, y: number) {
    const loc = this.uniforms[name]
    if (loc !== undefined) {
      this.gl.uniform2f(loc, x, y)
    }
  }

  setUniform1b(name: string, val: boolean) {
    const loc = this.uniforms[name]
    if (loc !== undefined) {
      this.gl.uniform1i(loc, val ? 1 : 0)
    }
  }

  dispose() {
    if (this.program) {
      this.gl.deleteProgram(this.program)
      this.program = null
      this.uniforms = {}
    }
  }
}
